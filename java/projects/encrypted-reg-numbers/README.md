"# Brute-Force-Decryption-of-Encrypted-Registration-Numbers"
# 🔐 Registration Number Decryption Tool

## Overview

This Java program decrypts and locates student registration numbers (e.g., `SP22-BSE-008`) within a large encrypted string. The encryption process involves two character shifts and a reversal, using a custom 37-character dictionary.

## Encryption Scheme

1. **First Shift**: Each character in the registration number is shifted forward by `key1` positions.
2. **Reversal**: The resulting string is reversed.
3. **Second Shift**: Each character of the reversed string is shifted forward by `key2` positions.

Both `key1` and `key2` range from 1 to 36.

## Features

- Custom dictionary handling
- Brute-force key search
- Efficient search using `indexOf()`
- Modular design with separate functions for shifting and reversing 
