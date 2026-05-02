
import os
import json
import time
import base64
import hashlib
from dataclasses import dataclass
from typing import Dict, List, Optional

# PyCryptodome imports
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from Crypto.Protocol.KDF import PBKDF2

# ---------- Utility helpers ----------
def now_ts() -> float:
    return time.time()

def sha256_hex(b: bytes) -> str:
    # Strict byte-by-byte SHA256 -> hex
    h = hashlib.sha256(b).hexdigest()
    return h

def mask_id(uid: str) -> str:
    h = hashlib.sha256(uid.encode()).hexdigest()
    return f"{h[:10]}...{uid[-4:]}"

# ---------- User model (RSA keys + PBKDF2 password) ----------
class User:
    def __init__(self, user_id: str, role: str):
        self.user_id = user_id
        self.role = role  # 'patient', 'doctor', 'admin', etc.
        self._pw_salt: Optional[bytes] = None
        self._pw_key: Optional[bytes] = None
        self._rsa_key = RSA.generate(2048)

    # PBKDF2 for password hashing
    def set_password(self, password: str, iterations: int = 200_000):
        salt = os.urandom(16)
        key = PBKDF2(password, salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)
        self._pw_salt = salt
        self._pw_key = key

    def check_password(self, password: str, iterations: int = 200_000) -> bool:
        if self._pw_salt is None or self._pw_key is None:
            return False
        key = PBKDF2(password, self._pw_salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)
        return key == self._pw_key

    # RSA / PEM helpers
    def export_public_key_pem(self) -> bytes:
        return self._rsa_key.publickey().export_key()

    def encrypt_with_public_key(self, plaintext: bytes, recipient_public_pem: bytes) -> bytes:
        recipient_key = RSA.import_key(recipient_public_pem)
        cipher = PKCS1_OAEP.new(recipient_key, hashAlgo=SHA256)
        return cipher.encrypt(plaintext)

    def decrypt_with_private_key(self, ciphertext: bytes) -> bytes:
        cipher = PKCS1_OAEP.new(self._rsa_key, hashAlgo=SHA256)
        return cipher.decrypt(ciphertext)

    def sign(self, data: bytes) -> bytes:
        # Sign the provided bytes by hashing them with SHA256 and using pkcs1_15
        h = SHA256.new(data)
        signature = pkcs1_15.new(self._rsa_key).sign(h)
        return signature

    def verify_signature(self, public_pem: bytes, data: bytes, signature: bytes) -> bool:
        try:
            pub = RSA.import_key(public_pem)
            h = SHA256.new(data)
            pkcs1_15.new(pub).verify(h, signature)
            return True
        except (ValueError, TypeError):
            return False

# ---------- Blockchain structures ----------
@dataclass
class Block:
    index: int
    timestamp: float
    issuer_id: str
    patient_id_masked: str
    encrypted_record_b64: str
    record_hash_hex: str
    key_shares: Dict[str, str]  # user_id -> base64(RSA-encrypted AESkey||nonce)
    signature_b64: str
    previous_hash: str
    nonce: int
    block_hash: Optional[str] = None

    def to_ordered_dict(self):
        # deterministic ordering for hashing
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "issuer_id": self.issuer_id,
            "patient_id_masked": self.patient_id_masked,
            "encrypted_record_b64": self.encrypted_record_b64,
            "record_hash_hex": self.record_hash_hex,
            "key_shares": self.key_shares,
            "signature_b64": self.signature_b64,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }

    def compute_hash(self) -> str:
        block_json = json.dumps(self.to_ordered_dict(), sort_keys=True).encode()
        return sha256_hex(block_json)

class Blockchain:
    def __init__(self, difficulty: int = 3):
        self.chain: List[Block] = []
        self.difficulty = difficulty
        self.create_genesis()

    def create_genesis(self):
        genesis = Block(index=0, timestamp=now_ts(), issuer_id="GENESIS", patient_id_masked="NONE",
                        encrypted_record_b64="", record_hash_hex="", key_shares={}, signature_b64="",
                        previous_hash="0", nonce=0)
        genesis.block_hash = genesis.compute_hash()
        self.chain.append(genesis)

    def last_hash(self) -> str:
        return self.chain[-1].block_hash

    def add_block(self, block: Block) -> bool:
        if block.previous_hash != self.last_hash():
            print("[Blockchain] previous_hash mismatch; block rejected.")
            return False
        if not block.block_hash or not block.block_hash.startswith("0" * self.difficulty):
            print("[Blockchain] invalid proof-of-work or missing block_hash; block rejected.")
            return False
        if block.block_hash != block.compute_hash():
            print("[Blockchain] stored block_hash doesn't match computed hash; block rejected.")
            return False
        self.chain.append(block)
        return True

    def is_valid_chain(self) -> bool:
        for i in range(1, len(self.chain)):
            cur = self.chain[i]
            prev = self.chain[i - 1]
            if cur.previous_hash != prev.block_hash:
                print(f"[Blockchain] broken linkage at index {i}.")
                return False
            if cur.block_hash != cur.compute_hash():
                print(f"[Blockchain] tampered block at index {i}.")
                return False
            if not cur.block_hash.startswith("0" * self.difficulty):
                print(f"[Blockchain] block at index {i} fails PoW difficulty.")
                return False
        return True

    def find_block_by_record_hash(self, record_hash_hex: str) -> Optional[Block]:
        for b in self.chain:
            if b.record_hash_hex == record_hash_hex:
                return b
        return None

# ---------- Patient Record System ----------
class PatientRecordSystem:
    def __init__(self, difficulty: int = 3):
        self.users: Dict[str, User] = {}
        self.blockchain = Blockchain(difficulty=difficulty)
        # for demo only: map record_hash -> aes_key||nonce stored server-side (NOT for prod)
        self._aes_storage: Dict[str, bytes] = {}

    # ---- users ----
    def register_user(self, user_id: str, password: str, role: str) -> bool:
        if user_id in self.users:
            print("[Register] user exists")
            return False
        u = User(user_id=user_id, role=role)
        u.set_password(password)
        self.users[user_id] = u
        print(f"[Register] {role} '{user_id}' registered.")
        return True

    def authenticate(self, user_id: str, password: str) -> Optional[User]:
        u = self.users.get(user_id)
        if not u:
            print("[Auth] user not found.")
            return None
        if u.check_password(password):
            return u
        print("[Auth] invalid password.")
        return None

    def get_public_key_pem(self, user_id: str) -> Optional[bytes]:
        u = self.users.get(user_id)
        if not u:
            return None
        return u.export_public_key_pem()

    # ---- issue record (encrypt + key sharing + signature + PoW mining) ----
    def issue_record(self, issuer_user: User, patient_id: str, record_data: dict, authorized_user_ids: List[str]) -> Optional[Block]:
        if issuer_user.role not in ('doctor', 'admin'):
            print("[Issue] only doctors or admin can issue records.")
            return None

        # 1) compute record hash (SHA256 of canonical plaintext)
        record_plain = json.dumps(record_data, sort_keys=True).encode()
        record_hash = sha256_hex(record_plain)

        # 2) AES-GCM encrypt the plaintext
        aes_key = os.urandom(32)  # 256-bit key
        nonce = os.urandom(12)    # 96-bit nonce for GCM
        cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(record_plain)
        # store blob = nonce || tag || ciphertext
        blob = nonce + tag + ciphertext
        blob_b64 = base64.b64encode(blob).decode()

        # store AES key||nonce server-side for demo (UNSAFE in prod)
        self._aes_storage[record_hash] = aes_key + nonce

        # 3) key_shares: encrypt aes_key||nonce for each authorized user using their RSA public key
        key_shares: Dict[str, str] = {}
        for uid in authorized_user_ids:
            user = self.users.get(uid)
            if not user:
                continue
            recipient_pub_pem = user.export_public_key_pem()
            # plaintext for RSA: aes_key||nonce
            plaintext_for_rsa = aes_key + nonce
            encrypted_key = issuer_user.encrypt_with_public_key(plaintext_for_rsa, recipient_pub_pem)
            key_shares[uid] = base64.b64encode(encrypted_key).decode()

        # 4) signature: sign the record hash bytes (we sign the hex string bytes)
        signature = issuer_user.sign(record_hash.encode())
        signature_b64 = base64.b64encode(signature).decode()

        # 5) build block and mine (PoW)
        previous_hash = self.blockchain.last_hash()
        block_index = len(self.blockchain.chain)
        nonce_counter = 0
        print(f"[Mining] Start mining block index {block_index} with difficulty {self.blockchain.difficulty} ...")
        start = time.time()
        while True:
            temp_block = Block(index=block_index, timestamp=now_ts(), issuer_id=issuer_user.user_id,
                               patient_id_masked=mask_id(patient_id), encrypted_record_b64=blob_b64,
                               record_hash_hex=record_hash, key_shares=key_shares, signature_b64=signature_b64,
                               previous_hash=previous_hash, nonce=nonce_counter)
            h = temp_block.compute_hash()
            if h.startswith("0" * self.blockchain.difficulty):
                temp_block.block_hash = h
                elapsed = time.time() - start
                print(f"[Mining] Done. Nonce={nonce_counter}, Hash={h}, Time={elapsed:.2f}s")
                success = self.blockchain.add_block(temp_block)
                if success:
                    print(f"[Issue] Record issued and added as block {temp_block.index}")
                    return temp_block
                else:
                    print("[Issue] Failed to add block after mining (unexpected).")
                    return None
            nonce_counter += 1

    # ---- verify a presented plaintext record is on-chain and signed by issuer ----
    def verify_record_by_plaintext(self, presented_plaintext_bytes: bytes, issuer_public_pem: bytes) -> bool:
        record_hash = sha256_hex(presented_plaintext_bytes)
        print(f"[Verify] Presented record hash: {record_hash}")
        if not self.blockchain.is_valid_chain():
            print("[Verify] Blockchain integrity failed.")
            return False
        block = self.blockchain.find_block_by_record_hash(record_hash)
        if not block:
            print("[Verify] No such record on-chain.")
            return False
        signature = base64.b64decode(block.signature_b64)
        try:
            # Verify signature: issuer signed record_hash bytes
            pub = RSA.import_key(issuer_public_pem)
            h = SHA256.new(record_hash.encode())
            pkcs1_15.new(pub).verify(h, signature)
            print("[Verify] Signature valid; record is authentic and present on chain.")
            return True
        except (ValueError, TypeError) as e:
            print("[Verify] Signature verification failed:", e)
            return False

    # ---- decrypt a record for an authorized user ----
    def decrypt_record_for_user(self, user: User, block: Block) -> Optional[bytes]:
        if user.user_id not in block.key_shares:
            print("[Decrypt] User not authorized to decrypt this record.")
            return None
        enc_key_b64 = block.key_shares[user.user_id]
        enc_key = base64.b64decode(enc_key_b64)
        try:
            key_nonce = user.decrypt_with_private_key(enc_key)  # returns aes_key||nonce
        except Exception as e:
            print("[Decrypt] RSA decrypt of AES key failed:", e)
            return None
        aes_key = key_nonce[:32]
        nonce = key_nonce[32:44]
        blob = base64.b64decode(block.encrypted_record_b64)
        # blob format: nonce (12) | tag (16) | ciphertext (...)
        b_nonce = blob[0:12]
        tag = blob[12:28]
        ciphertext = blob[28:]
        # sanity check: nonce from key share should match nonce in blob
        if nonce != b_nonce:
            print("[Decrypt] Warning: nonce from key-share doesn't match nonce in blob; continuing if possible.")
        try:
            cipher = AES.new(aes_key, AES.MODE_GCM, nonce=b_nonce)
            plaintext = cipher.decrypt_and_verify(ciphertext, tag)
            return plaintext
        except Exception as e:
            print("[Decrypt] AES-GCM decrypt/verify failed:", e)
            return None

    def show_chain(self):
        for b in self.blockchain.chain:
            print("---- BLOCK", b.index, "----")
            print("Issuer:", b.issuer_id, "| Patient:", b.patient_id_masked)
            print("Record Hash:", b.record_hash_hex)
            print("Prev Hash:", b.previous_hash)
            print("Nonce:", b.nonce)
            print("Block Hash:", b.block_hash)
            print()

# ---------- Simple menu-driven CLI ----------
def main_menu():
    print("=== Patient Health Record System (PyCryptodome) ===")
    print("1) Start demo server (preload sample users)")
    print("2) Use empty server")
    print("0) Exit")
    choice = input("> ").strip()
    return choice

def user_menu(logged_user: User):
    print(f"\n--- Logged in as: {logged_user.user_id} ({logged_user.role}) ---")
    print("1) Issue record (doctor/admin only)")
    print("2) Show blockchain")
    print("3) Verify record by presenting plaintext")
    print("4) Decrypt a record from chain (if authorized)")
    print("5) Tamper test (modify block 1's encrypted blob) [demo only]")
    print("6) Logout")
    print("0) Exit program")
    return input("> ").strip()

def prompt_record_input():
    print("Enter record fields. Hit Enter to accept example values.")
    name = input("Patient name [Ali Khan]: ").strip() or "Ali Khan"
    pid = input("Patient id [patient_ali]: ").strip() or "patient_ali"
    diagnosis = input("Diagnosis [Acute pharyngitis]: ").strip() or "Acute pharyngitis"
    prescription = input("Prescription [Azithromycin 500mg once daily for 3 days]: ").strip() or "Azithromycin 500mg once daily for 3 days"
    issued_at = input(f"Issued at [{time.strftime('%Y-%m-%d')}]: ").strip() or time.strftime('%Y-%m-%d')
    record = {
        "patient_name": name,
        "patient_id": pid,
        "diagnosis": diagnosis,
        "prescription": prescription,
        "issued_at": issued_at
    }
    return pid, record

def run_cli():
    prs = None
    while True:
        choice = main_menu()
        if choice == "0":
            print("Bye.")
            return
        if choice not in ("1","2"):
            print("Invalid choice.")
            continue

        # Initialize system
        if choice == "1":
            prs = PatientRecordSystem(difficulty=3)
            # preload users
            prs.register_user("patient_ali", "patient_pass", "patient")
            prs.register_user("dr_ahmad", "doctor_pass", "doctor")
            prs.register_user("admin", "admin_pass", "admin")
            print("Preloaded users: patient_ali / dr_ahmad / admin (passwords shown).")
        else:
            prs = PatientRecordSystem(difficulty=3)
            print("Empty server created. Register users first.")

        # user session loop
        current_user: Optional[User] = None
        while True:
            if current_user is None:
                print("\n--- Not logged in ---")
                print("1) Register")
                print("2) Login")
                print("3) Show blockchain")
                print("0) Back to main menu / Exit")
                a = input("> ").strip()
                if a == "0":
                    break
                if a == "1":
                    uid = input("New user id: ").strip()
                    pwd = input("Password: ").strip()
                    role = input("Role (patient/doctor/admin): ").strip()
                    if prs.register_user(uid, pwd, role):
                        print("Registered.")
                    else:
                        print("Registration failed.")
                    continue
                if a == "2":
                    uid = input("User id: ").strip()
                    pwd = input("Password: ").strip()
                    u = prs.authenticate(uid, pwd)
                    if u:
                        current_user = u
                        print(f"Welcome, {u.user_id}!")
                    else:
                        print("Login failed.")
                    continue
                if a == "3":
                    prs.show_chain()
                    continue
                print("Unknown option.")
            else:
                # logged in menu
                choice2 = user_menu(current_user)
                if choice2 == "0":
                    print("Exiting program.")
                    return
                if choice2 == "6":
                    print("Logging out.")
                    current_user = None
                    continue
                if choice2 == "1":
                    if current_user.role not in ('doctor','admin'):
                        print("Only doctors or admin can issue records.")
                        continue
                    pid, record = prompt_record_input()
                    # choose authorized users
                    print("Enter authorized user ids separated by comma (e.g. patient_ali,dr_ahmad,admin)")
                    auth_input = input("Authorized users: ").strip()
                    auth_list = [s.strip() for s in auth_input.split(",") if s.strip()]
                    if not auth_list:
                        print("No authorized users provided; defaulting to patient and issuer.")
                        auth_list = [pid, current_user.user_id]
                    block = prs.issue_record(issuer_user=current_user, patient_id=pid, record_data=record, authorized_user_ids=auth_list)
                    if block:
                        print(f"Record issued in block {block.index}")
                    else:
                        print("Failed to issue record.")
                    continue
                if choice2 == "2":
                    prs.show_chain()
                    continue
                if choice2 == "3":
                    # verify by presenting plaintext
                    print("Enter JSON record (or press enter to use last sample format)")
                    raw = input("Record JSON (or blank to build one): ").strip()
                    if not raw:
                        pid, record = prompt_record_input()
                        presented = json.dumps(record, sort_keys=True).encode()
                    else:
                        try:
                            obj = json.loads(raw)
                            presented = json.dumps(obj, sort_keys=True).encode()
                        except Exception as e:
                            print("Invalid JSON:", e)
                            continue
                    issuer_id = input("Issuer user id (who signed the record): ").strip()
                    pub = prs.get_public_key_pem(issuer_id)
                    if not pub:
                        print("Unknown issuer id.")
                        continue
                    ok = prs.verify_record_by_plaintext(presented, pub)
                    print("Verification OK?", ok)
                    continue
                if choice2 == "4":
                    # decrypt a record for logged in user
                    tid = input("Enter record hash (record_hash_hex) or block index [enter to list latest blocks]: ").strip()
                    block = None
                    if tid == "":
                        # list blocks
                        print("Latest blocks:")
                        for b in prs.blockchain.chain:
                            print(f"Index {b.index} | Issuer {b.issuer_id} | RecordHash {b.record_hash_hex}")
                        sel = input("Enter block index to decrypt: ").strip()
                        if not sel.isdigit():
                            print("Invalid index.")
                            continue
                        idx = int(sel)
                        if idx < 0 or idx >= len(prs.blockchain.chain):
                            print("Index out of range.")
                            continue
                        block = prs.blockchain.chain[idx]
                    else:
                        # try to find by hash
                        block = prs.blockchain.find_block_by_record_hash(tid)
                        if not block:
                            print("No block with that record hash.")
                            continue
                    plaintext = prs.decrypt_record_for_user(current_user, block)
                    if plaintext:
                        print("Decrypted record plaintext:")
                        try:
                            pretty = json.loads(plaintext.decode())
                            print(json.dumps(pretty, indent=2))
                        except Exception:
                            print(plaintext.decode())
                    else:
                        print("Could not decrypt (not authorized or decryption failed).")
                    continue
                if choice2 == "5":
                    # Tamper test: modify block 1 encrypted blob to 'tampered'
                    if len(prs.blockchain.chain) <= 1:
                        print("No block 1 to tamper with.")
                        continue
                    prs.blockchain.chain[1].encrypted_record_b64 = "tampered"
                    valid = prs.blockchain.is_valid_chain()
                    print("Chain valid after tamper?", valid)
                    continue
                print("Unknown option.")

        # back to main menu prompt

if __name__ == "__main__":
    run_cli()
