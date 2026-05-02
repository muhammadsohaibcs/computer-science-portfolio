# 🔐 Information Security & Cryptography Masterclass

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](.)
[![Cryptography](https://img.shields.io/badge/Cryptography-Enterprise%20Grade-red?style=for-the-badge)](.)
[![Zero%20Trust](https://img.shields.io/badge/Architecture-Zero%20Trust-darkred?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](.)

**Elite cryptographic implementations, zero-trust systems, and enterprise-grade security architectures**

</div>

---

## 📂 Directory Structure

```
information-security/
├── assignment-3/              # Cryptography fundamentals
│   ├── q1_diffie_hellman.py  # Key exchange protocol
│   ├── q2_dh_mitm.py         # Attack mitigation
│   ├── q3_elgamal.py         # Asymmetric encryption
│   ├── q4_elgamal_attack.py  # Cryptanalysis
│   └── q5_hybrid.py          # Hybrid encryption
│
├── assignment-4/              # Advanced security topics
│   ├── task1.py              # RSA implementation
│   ├── task2.py              # Digital signatures
│   ├── task3.py              # Certificate management
│   ├── task4.py              # Secure protocols
│   └── task5.py              # Key management
│
├── final-project-raw/         # Comprehensive security project
│   └── Secure Drone Command System
│
├── finaltermproject/          # Encryption pipeline
│
├── lab-tasks/                 # Hands-on cryptography labs
│   ├── Classical ciphers
│   ├── Frequency analysis
│   ├── Cryptanalysis
│   └── Protocol security
│
├── midterm/                   # Security assessment
│
└── README.md
```

---

## 🎯 Featured Project: Secure Drone Command Authorization System

### Project Overview

**Secure Drone Command Authorization System (SDRCAS)** is an enterprise-grade, zero-trust cryptographic control system designed for autonomous systems, drones, and robots. Every command undergoes multi-layer cryptographic verification before execution, ensuring maximum security and reliability.

### 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────┐
│    Command Interface (Control Station)              │
│  - User authentication & MFA                        │
│  - Command preparation & validation                 │
│  - Digital signing (Ed25519)                        │
└────────────────────┬─────────────────────────────────┘
                     │
            ┌────────▼─────────┐
            │ Encryption Layer │
            │  (AES-256-GCM)   │
            └────────┬─────────┘
                     │
            ┌────────▼──────────────┐
            │ Authentication Layer  │
            │ (Digital Signatures)  │
            └────────┬──────────────┘
                     │
    ┌────────────────▼────────────────┐
    │   Transmission Layer            │
    │ (Secure channel - TLS 1.3+)     │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼──────────────────────┐
    │  Verification & Validation (Receiver) │
    │  ✓ Signature verification             │
    │  ✓ Decryption                         │
    │  ✓ Timestamp & nonce validation       │
    │  ✓ Replay attack check                │
    │  ✓ Authorization re-verification      │
    │  ✓ Rate limiting check                │
    └────────────────┬──────────────────────┘
                     │
    ┌────────────────▼──────────────────┐
    │  Command Execution (Post Checks)  │
    │  Only after ALL verifications     │
    └────────────────┬──────────────────┘
                     │
    ┌────────────────▼──────────────────┐
    │   Blockchain Audit Trail          │
    │  (Immutable execution logging)    │
    └───────────────────────────────────┘
```

### 🔐 Security Features

#### Cryptographic Components
- ✅ **AES-256-GCM Encryption** - Authenticated encryption with associated data
- ✅ **Ed25519 Digital Signatures** - Modern elliptic curve signatures
- ✅ **HMAC-SHA256** - Message authentication codes
- ✅ **PBKDF2/Argon2** - Key derivation from passwords
- ✅ **Secure Random Number Generation** - Cryptographically secure RNG
- ✅ **TLS 1.3+** - Transport layer security

#### Zero-Trust Validation
- ✅ **Every command verified** - No trust, always verify
- ✅ **Multi-layer authentication** - User + device + command
- ✅ **Role-based authorization** - Fine-grained permissions
- ✅ **Command integrity** - Tamper detection
- ✅ **Authenticity verification** - Source authentication

#### Attack Prevention
- ✅ **Replay Attack Protection** - Nonces + timestamps + sequence numbers
- ✅ **Man-in-the-Middle Defense** - Authenticated encryption + PKI
- ✅ **Brute-Force Protection** - Rate limiting + exponential backoff
- ✅ **Timing Attack Resistance** - Constant-time comparisons
- ✅ **Command Injection Prevention** - Sanitization + validation

#### Audit & Compliance
- ✅ **Blockchain-Based Logging** - Immutable audit trail
- ✅ **Timestamped Records** - Cryptographic timestamps
- ✅ **Access Control Logs** - Authorization tracking
- ✅ **Compliance Reporting** - Security certifications
- ✅ **Incident Investigation** - Forensic audit trail

### 💻 Technology Stack

```
Python 3.8+                    - Implementation
cryptography (PyCA)            - Cryptographic primitives
PyCryptodome                   - Additional crypto tools
PyJWT                          - JWT token handling
Web3.py / Brownie              - Blockchain integration
SQLAlchemy                     - Secure data storage
pytest + hypothesis            - Security testing
OpenSSL                        - Cryptographic tools
```

### 🛡️ Cryptographic Implementations

**Symmetric Encryption (AES-256-GCM)**
```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

# 256-bit key for maximum security
key = os.urandom(32)  # 256 bits
iv = os.urandom(12)   # 96-bit nonce (12 bytes)

cipher = Cipher(
    algorithms.AES(key),
    modes.GCM(iv),
    backend=default_backend()
)

# Encryption with authentication
encryptor = cipher.encryptor()
ciphertext = encryptor.update(plaintext) + encryptor.finalize()
tag = encryptor.tag  # Authentication tag
```

**Digital Signatures (Ed25519)**
```python
from cryptography.hazmat.primitives.asymmetric import ed25519

# Generate keypair
private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

# Signing
signature = private_key.sign(message)

# Verification
public_key.verify(signature, message)  # Raises exception if invalid
```

**Key Exchange (Diffie-Hellman)**
```python
# Secure key establishment over insecure channel
# Protected against MITM with digital signatures
```

### 🔄 Command Execution Flow

1. **Authentication Phase**
   - User login with MFA
   - Session token generation (JWT with expiration)
   - Device verification

2. **Authorization Phase**
   - Role-based access control check
   - Command permission verification
   - Rate limit verification

3. **Command Preparation**
   - Input validation and sanitization
   - Timestamp generation
   - Nonce generation for replay protection

4. **Cryptographic Processing**
   - Command data encryption (AES-256-GCM)
   - Digital signature generation (Ed25519)
   - Metadata encryption

5. **Secure Transmission**
   - TLS 1.3+ encrypted channel
   - Authenticated transmission
   - Network security checks

6. **Receiver-Side Verification**
   ```
   if NOT verify_signature():
       REJECT (authentication failed)
   if NOT decrypt_command():
       REJECT (integrity compromised)
   if NOT validate_timestamp():
       REJECT (replay attack detected)
   if NOT check_nonce():
       REJECT (nonce reuse detected)
   if NOT verify_authorization():
       REJECT (unauthorized command)
   if NOT check_rate_limit():
       REJECT (rate limit exceeded)
   EXECUTE_COMMAND()
   LOG_TO_BLOCKCHAIN()
   ```

7. **Execution & Logging**
   - Command execution after ALL checks pass
   - Immediate blockchain logging
   - Status reporting to command center

### 📚 Curriculum Overview

#### Assignment 3: Cryptographic Protocols & Attacks
| Topic | Coverage |
|-------|----------|
| Diffie-Hellman Key Exchange | Mathematical foundations, implementation |
| Man-in-the-Middle Attacks | Vulnerability analysis, mitigation |
| ElGamal Encryption | Asymmetric crypto, semantic security |
| Cryptanalysis | Attack techniques, breaking weak ciphers |
| Hybrid Encryption | Combining symmetric + asymmetric |

#### Assignment 4: Advanced Security & PKI
| Topic | Coverage |
|-------|----------|
| RSA Encryption | Public key cryptography |
| Digital Signatures | Authentication & non-repudiation |
| Certificate Management | PKI fundamentals, trust chains |
| Secure Protocols | End-to-end encryption design |
| Key Management | Secure storage, rotation, lifecycle |

#### Lab Tasks: Cryptanalysis & Protocol Security
- Classical ciphers (Caesar, Vigenère)
- Frequency analysis attacks
- Substitution cipher breaking
- Modern cipher analysis
- Protocol vulnerability detection

#### Midterm: Encryption Pipeline
- Multi-layer encryption system
- Key management system
- Error handling & recovery
- Performance optimization
- Security validation

#### Final Project: Secure Drone Command Authorization System
- Zero-trust architecture
- Multi-layer cryptographic security
- Blockchain audit logging
- Enterprise deployment ready

### 🎓 Learning Outcomes

✅ Understand cryptographic mathematics and principles  
✅ Implement cryptographic algorithms securely  
✅ Design zero-trust security architectures  
✅ Protect against real-world attacks  
✅ Build enterprise-grade security systems  
✅ Perform cryptanalysis and threat modeling  
✅ Create secure communication protocols  
✅ Implement blockchain-based audit trails  

### 📚 Key Concepts

| Concept | Description | Application |
|---------|-------------|------------|
| **Zero Trust** | Never trust, always verify | Every command verified |
| **Defense in Depth** | Multiple security layers | Cryptography + auth + logging |
| **Asymmetric Crypto** | Different keys for encryption/verification | Digital signatures |
| **Symmetric Crypto** | Same key for encryption/decryption | Fast data encryption (AES) |
| **HMAC** | Message authentication codes | Integrity verification |
| **PKI** | Public Key Infrastructure | Certificate-based trust |

### 🧪 Security Testing

**Test Coverage**
- ✅ Cryptographic strength verification
- ✅ Algorithm correctness validation
- ✅ Attack simulation and defense
- ✅ Key derivation quality testing
- ✅ Signature validity verification
- ✅ Replay attack detection
- ✅ MITM protection verification

### 📊 Threat Model Addressed

```
Threat                    Mitigation
────────────────────────────────────────────
Eavesdropping            → AES-256-GCM encryption
Command tampering        → HMAC + digital signatures
Replay attacks           → Nonces, timestamps, sequence
MITM attacks             → Authenticated encryption + PKI
Brute-force              → Rate limiting, exponential backoff
Unauthorized execution   → RBAC + re-verification
Timing attacks           → Constant-time operations
Denial of service        → Rate limiting, resource controls
```

### 🚀 Deployment & Operations

**Production Considerations**
- Hardware security modules (HSM) for key storage
- Secure key rotation procedures
- Network segmentation
- Intrusion detection systems
- Regular security audits
- Penetration testing
- Incident response procedures

---

## 📖 Study Resources

### Recommended Books
- **Applied Cryptography** - Bruce Schneier
- **Understanding Cryptography** - Paar & Pelzl
- **Cryptography Engineering** - Ferguson, Schneier, Kohno

### Online Resources
- **Coursera:** Cryptography (Dan Boneh)
- **OWASP:** Security Guidelines
- **NIST:** Cryptography Standards
- **PyCA:** cryptography.io Documentation

### Tools & Utilities
- OpenSSL - Cryptographic toolkit
- Wireshark - Packet analysis
- Burp Suite - Web security testing
- OWASP ZAP - Vulnerability scanning

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **Web Development:** [../web-development](../web-development)
- **Machine Learning:** [../machine-learning](../machine-learning)

---

<div align="center">

**Cryptography is the cornerstone of modern security. Every bit of protection must be cryptographically verifiable.**

*Building trust through mathematics, not assumptions.*

</div>
