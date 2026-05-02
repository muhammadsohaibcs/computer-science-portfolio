# Post-Quantum Cryptography Module

## Overview

The `postquantum.py` module implements hybrid key exchange combining classical X25519 ECDH with post-quantum Kyber KEM (Key Encapsulation Mechanism). This provides defense-in-depth: the system remains secure as long as at least one of the algorithms (classical or post-quantum) is unbroken.

## Features

- **Post-Quantum Key Generation**: Generate Kyber keypairs for KEM
- **Key Encapsulation**: Sender generates and encapsulates a shared secret
- **Key Decapsulation**: Receiver extracts the shared secret using their private key
- **Hybrid Key Exchange**: Combines classical and PQ shared secrets using HKDF
- **Multiple Kyber Variants**: Supports Kyber512, Kyber768, and Kyber1024

## Installation

### Linux/macOS

The `liboqs-python` library should install automatically:

```bash
pip install liboqs-python>=0.8.0
```

### Windows

On Windows, `liboqs-python` requires pre-compiled binaries or manual compilation. If automatic installation fails:

1. **Option 1: Use WSL (Windows Subsystem for Linux)**
   - Install WSL and run the system in a Linux environment
   - Install liboqs-python normally in WSL

2. **Option 2: Manual Compilation**
   - Install Visual Studio Build Tools
   - Install CMake
   - Follow the liboqs compilation guide: https://github.com/open-quantum-safe/liboqs-python

3. **Option 3: Mock Mode (Testing Only)**
   - The module includes a fallback mock implementation
   - Automatically used when liboqs is not available
   - Suitable for development and testing
   - **NOT suitable for production use**

## Usage

### Basic Key Exchange

```python
from core.postquantum import pq_generate_keypair, pq_encapsulate, pq_decapsulate

# Receiver generates keypair
private_key, public_key = pq_generate_keypair()

# Sender encapsulates a shared secret
ciphertext, shared_secret_sender = pq_encapsulate(public_key)

# Receiver decapsulates to get the same shared secret
shared_secret_receiver = pq_decapsulate(private_key, ciphertext)

assert shared_secret_sender == shared_secret_receiver
```

### Hybrid Key Exchange

```python
from core.postquantum import hybrid_key_exchange
from core.key_exchange import perform_key_exchange, generate_x25519_keypair

# Perform classical key exchange
alice_private, alice_public = generate_x25519_keypair()
bob_private, bob_public = generate_x25519_keypair()
classical_shared = perform_key_exchange(alice_private, bob_public)

# Perform post-quantum key exchange
pq_private, pq_public = pq_generate_keypair()
ciphertext, pq_shared = pq_encapsulate(pq_public)

# Combine both into hybrid key
hybrid_key = hybrid_key_exchange(classical_shared, pq_shared)
```

### Different Kyber Variants

```python
# Kyber512 - Security level 1 (equivalent to AES-128)
private_key, public_key = pq_generate_keypair("Kyber512")

# Kyber768 - Security level 3 (equivalent to AES-192)
private_key, public_key = pq_generate_keypair("Kyber768")

# Kyber1024 - Security level 5 (equivalent to AES-256)
private_key, public_key = pq_generate_keypair("Kyber1024")
```

## Security Considerations

### Why Hybrid?

Hybrid key exchange provides defense-in-depth:
- If quantum computers break classical algorithms (X25519), the PQ component keeps data secure
- If a flaw is found in Kyber, the classical component maintains security
- The final key is secure as long as at least one algorithm remains unbroken

### Algorithm Selection

- **Kyber512**: Fastest, suitable for most applications, security level 1
- **Kyber768**: Balanced performance and security, security level 3 (recommended)
- **Kyber1024**: Highest security, slower, security level 5

### Mock Mode Warning

The mock implementation is **NOT cryptographically secure** and should **NEVER** be used in production. It:
- Uses random data instead of actual KEM operations
- Does not provide post-quantum security
- Is only suitable for testing and development

Always verify `LIBOQS_AVAILABLE` is `True` in production:

```python
from core.postquantum import LIBOQS_AVAILABLE

if not LIBOQS_AVAILABLE:
    raise RuntimeError("Production deployment requires real liboqs library")
```

## Testing

Run the test suite:

```bash
pytest tests/test_postquantum.py -v
```

Note: Some tests are skipped in mock mode as they test security properties that can't be simulated.

## References

- [NIST Post-Quantum Cryptography Standardization](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Kyber Specification](https://pq-crystals.org/kyber/)
- [liboqs Library](https://github.com/open-quantum-safe/liboqs)
- [liboqs-python Bindings](https://github.com/open-quantum-safe/liboqs-python)
