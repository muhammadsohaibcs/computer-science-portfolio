import random
import string

def split_len(seq, length):
    return [seq[i:i + length] for i in range(0, len(seq), length)]

def generate_key(length):
    numbers = list(range(1, length + 1))
    random.shuffle(numbers)
    return "".join(map(str, numbers))

def encode(key, plaintext):
    if not key: 
        key = generate_key(len(plaintext))

    pad_char = "_"
    while len(plaintext) % len(key) != 0:
        plaintext += pad_char

    order = {int(val): num for num, val in enumerate(key)}
    ciphertext = ''
    for index in sorted(order.keys()):
        for part in split_len(plaintext, len(key)):
            try:
                ciphertext += part[order[index]]
            except IndexError:
                pass
    return ciphertext




def decode(key, ciphertext):
    order = {int(val): num for num, val in enumerate(key)}
    n_cols = len(key)
    n_rows = len(ciphertext)

    grid = [[""] * n_cols for _ in range(n_rows)]
    print(grid)
    k = 0
    for index in sorted(order.keys()):
        col = order[index]
        for row in range(n_rows):
            grid[row][col] = ciphertext[k]
            k += 1

    plaintext = "".join("".join(row) for row in grid)
    return plaintext.replace("_", "")


def menu():
    while True:
        print("\n$$$ Transposition Cipher Menu $$$")
        print("1. Encode")
        print("2. Decode")
        print("3. Exit")
        choice = input("Enter your choice: ")

        if choice == "1":
            plaintext = input("Enter plaintext: ")
            key = input("Enter key (leave blank for random): ")
            ciphertext = encode(key, plaintext)
            print("Ciphertext:", ciphertext)

        elif choice == "2":
            ciphertext = input("Enter ciphertext: ")
            key = input("Enter key used for encryption: ")
            plaintext = decode(key, ciphertext)
            print("Plaintext:", plaintext)

        elif choice == "3":
            print("Exiting...")
            break

        else:
            print("Invalid choice, try again!")


menu()

