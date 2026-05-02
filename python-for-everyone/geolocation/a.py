def split_len(seq, length):
    return [seq[i:i + length] for i in range(0, len(seq), length)]

def encode(key, plaintext):
    ciphertext = ''
    for index in key:
        real_index = int(index) - 1     # convert to 0-based
        for part in split_len(plaintext, len(key)):
            try:
                ciphertext += part[real_index]
            except IndexError:
                pass
    return ciphertext

print(encode('3214', 'HELLO'))
