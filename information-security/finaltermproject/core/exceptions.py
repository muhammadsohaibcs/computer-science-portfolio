"""
Custom exceptions for SDRCAS cryptographic operations.
Provides secure error handling without leaking sensitive information.

Requirements: 13.1, 13.4
"""


class CryptoError(Exception):
    """Base exception for all cryptographic errors."""
    
    def __init__(self, message: str, operation: str = None):
        """
        Initialize a cryptographic error.
        
        Args:
            message: Error message (should not contain sensitive data)
            operation: Name of the operation that failed (optional)
        """
        self.operation = operation
        super().__init__(message)
    
    def __str__(self):
        if self.operation:
            return f"Cryptographic error in {self.operation}: {super().__str__()}"
        return f"Cryptographic error: {super().__str__()}"


class KeyGenerationError(CryptoError):
    """Exception raised when key generation fails."""
    pass


class SignatureError(CryptoError):
    """Exception raised when signing or signature verification fails."""
    pass


class EncryptionError(CryptoError):
    """Exception raised when encryption fails."""
    pass


class DecryptionError(CryptoError):
    """Exception raised when decryption fails."""
    pass


class KeySerializationError(CryptoError):
    """Exception raised when key serialization/deserialization fails."""
    pass


class KeyExchangeError(CryptoError):
    """Exception raised when key exchange fails."""
    pass


class HashingError(CryptoError):
    """Exception raised when hashing operations fail."""
    pass


class PostQuantumError(CryptoError):
    """Exception raised when post-quantum operations fail."""
    pass


class InvalidInputError(CryptoError):
    """Exception raised when input validation fails."""
    pass
