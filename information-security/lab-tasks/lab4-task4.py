from Crypto.Cipher import AES, DES
from Crypto.Random import get_random_bytes

def pad(data, block):
    pad_len = block - (len(data) % block)
    return data + bytes([pad_len]) * pad_len

def unpad(data):
    return data[:-data[-1]]

def encrypt_file(input_file, output_file):
    with open(input_file, "rb") as f:
        data = f.read()

    mid = len(data) // 2
    part1, part2 = data[:mid], data[mid:]

    # AES-CBC for first half
    aes_key = get_random_bytes(16)
    aes_iv = get_random_bytes(16)
    aes_cipher = AES.new(aes_key, AES.MODE_CBC, aes_iv)
    aes_ct = aes_cipher.encrypt(pad(part1, 16))

    # DES-ECB for second half
    des_key = get_random_bytes(8)
    des_cipher = DES.new(des_key, DES.MODE_ECB)
    des_ct = des_cipher.encrypt(pad(part2, 8))

    # Save
    with open(output_file, "wb") as f:
        f.write(aes_iv + aes_ct + des_ct)

    print("File encrypted →", output_file)
    return aes_key, aes_iv, des_key, mid

def decrypt_file(enc_file, output_file, aes_key, aes_iv, des_key, mid):
    with open(enc_file, "rb") as f:
        data = f.read()

    aes_ct = data[16:16 + ((mid + 15)//16)*16]
    des_ct = data[16 + ((mid + 15)//16)*16:]

    aes_dec = AES.new(aes_key, AES.MODE_CBC, aes_iv).decrypt(aes_ct)
    des_dec = DES.new(des_key, DES.MODE_ECB).decrypt(des_ct)

    original = unpad(aes_dec) + unpad(des_dec)

    with open(output_file, "wb") as f:
        f.write(original)
    print("File decrypted →", output_file)

# Example usage
open("sample.txt", "wb").write(b"Hello, this is a test file for AES+DES encryption demo.")
aes_k, aes_iv, des_k, mid = encrypt_file("sample.txt", "enc.bin")
decrypt_file("enc.bin", "dec.txt", aes_k, aes_iv, des_k, mid)
