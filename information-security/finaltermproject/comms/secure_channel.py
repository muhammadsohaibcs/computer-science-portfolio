"""
Secure channel module for SDRCAS communication layer.
Implements authenticated and encrypted communication channels with mutual authentication.
"""

import socket
import time
from typing import Optional, Tuple
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey, X25519PublicKey

from core.key_exchange import (
    generate_x25519_keypair,
    perform_key_exchange,
    derive_session_key,
    serialize_x25519_public_key,
    deserialize_x25519_public_key
)
from core.aead import encrypt_aead, decrypt_aead
from core.authentication import sign, verify_signature
from core.crypto_math import secure_random_bytes
from .packet import Packet, create_packet, serialize_packet, deserialize_packet


class SecureChannelError(Exception):
    """Base exception for secure channel errors."""
    pass


class HandshakeError(SecureChannelError):
    """Exception raised when handshake fails."""
    pass


class ChannelClosedError(SecureChannelError):
    """Exception raised when attempting to use a closed channel."""
    pass


class SecureChannel:
    """
    Secure communication channel with mutual authentication and encryption.
    
    Implements a custom authenticated encryption protocol:
    1. Handshake phase: Mutual authentication and key exchange
    2. Communication phase: AEAD-encrypted packets
    3. Reconnection: Automatic reconnection with exponential backoff
    
    Attributes:
        peer_address: Address of the peer (host, port)
        peer_public_key: Ed25519 public key of the peer for authentication
        local_private_key: Ed25519 private key for authentication
        
    Requirements: 6.1, 6.2
    """
    
    def __init__(self, local_private_key: Ed25519PrivateKey, 
                 local_public_key: Ed25519PublicKey,
                 peer_public_key: Ed25519PublicKey):
        """
        Initialize secure channel.
        
        Args:
            local_private_key: Our Ed25519 private key for authentication
            local_public_key: Our Ed25519 public key for authentication
            peer_public_key: Peer's Ed25519 public key for authentication
        """
        self.local_private_key = local_private_key
        self.local_public_key = local_public_key
        self.peer_public_key = peer_public_key
        
        self.peer_address: Optional[Tuple[str, int]] = None
        self.socket: Optional[socket.socket] = None
        self.session_key: Optional[bytes] = None
        self.sequence_send: int = 0
        self.sequence_recv: int = 0
        self.is_established: bool = False
        
        # Reconnection parameters
        self.max_reconnect_attempts = 5
        self.reconnect_delay = 1.0  # Initial delay in seconds
        self.max_reconnect_delay = 30.0
    
    def establish(self, peer_address: Tuple[str, int], is_initiator: bool = True) -> None:
        """
        Establish a secure channel with mutual authentication.
        
        This performs:
        1. TCP connection
        2. Key exchange (X25519)
        3. Mutual authentication (Ed25519 signatures)
        4. Session key derivation
        
        Args:
            peer_address: Tuple of (host, port) for the peer
            is_initiator: True if we initiate the connection, False if accepting
            
        Raises:
            HandshakeError: If handshake fails
            ConnectionError: If connection cannot be established
            
        Requirements: 6.1, 6.2
        """
        self.peer_address = peer_address
        
        try:
            # Establish TCP connection
            if is_initiator:
                self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.socket.connect(peer_address)
            # If not initiator, socket should be provided via accept()
            
            # Perform handshake
            self._perform_handshake(is_initiator)
            
            self.is_established = True
            self.sequence_send = 0
            self.sequence_recv = 0
            
        except Exception as e:
            self.close()
            raise HandshakeError(f"Failed to establish secure channel: {e}")
    
    def _perform_handshake(self, is_initiator: bool) -> None:
        """
        Perform mutual authentication and key exchange handshake.
        
        Handshake protocol:
        1. Both parties generate ephemeral X25519 key pairs
        2. Exchange public keys
        3. Sign the peer's public key with our Ed25519 key
        4. Verify peer's signature
        5. Derive session key from shared secret
        
        Args:
            is_initiator: True if we initiate, False if we respond
            
        Raises:
            HandshakeError: If handshake fails
        """
        # Generate ephemeral X25519 key pair for this session
        x25519_private, x25519_public = generate_x25519_keypair()
        our_x25519_public_bytes = serialize_x25519_public_key(x25519_public)
        
        if is_initiator:
            # Send our X25519 public key
            self._send_raw(our_x25519_public_bytes)
            
            # Receive peer's X25519 public key
            peer_x25519_public_bytes = self._recv_raw(32)
            peer_x25519_public = deserialize_x25519_public_key(peer_x25519_public_bytes)
            
            # Sign peer's public key to prove our identity
            our_signature = sign(self.local_private_key, peer_x25519_public_bytes)
            self._send_raw(our_signature)
            
            # Receive and verify peer's signature
            peer_signature = self._recv_raw(64)  # Ed25519 signatures are 64 bytes
            if not verify_signature(self.peer_public_key, our_x25519_public_bytes, peer_signature):
                raise HandshakeError("Peer authentication failed: invalid signature")
        else:
            # Receive peer's X25519 public key
            peer_x25519_public_bytes = self._recv_raw(32)
            peer_x25519_public = deserialize_x25519_public_key(peer_x25519_public_bytes)
            
            # Send our X25519 public key
            self._send_raw(our_x25519_public_bytes)
            
            # Receive and verify peer's signature
            peer_signature = self._recv_raw(64)
            if not verify_signature(self.peer_public_key, our_x25519_public_bytes, peer_signature):
                raise HandshakeError("Peer authentication failed: invalid signature")
            
            # Sign peer's public key to prove our identity
            our_signature = sign(self.local_private_key, peer_x25519_public_bytes)
            self._send_raw(our_signature)
        
        # Perform key exchange
        shared_secret = perform_key_exchange(x25519_private, peer_x25519_public)
        
        # Derive session key
        context = b"SDRCAS-secure-channel-v1"
        self.session_key = derive_session_key(shared_secret, context)
    
    def send(self, data: bytes, packet_type: str = "COMMAND") -> None:
        """
        Send data over the secure channel.
        
        Data is encrypted using AEAD and sent as a packet.
        
        Args:
            data: Data to send
            packet_type: Type of packet (default: COMMAND)
            
        Raises:
            ChannelClosedError: If channel is not established
            SecureChannelError: If send fails
            
        Requirements: 6.1
        """
        if not self.is_established or self.session_key is None:
            raise ChannelClosedError("Channel is not established")
        
        try:
            # Create packet
            packet = create_packet(packet_type, data, self.sequence_send)
            self.sequence_send += 1
            
            # Serialize packet
            packet_bytes = serialize_packet(packet)
            
            # Encrypt packet with AEAD
            associated_data = f"{packet_type}:{self.sequence_send-1}".encode('utf-8')
            ciphertext, nonce = encrypt_aead(self.session_key, packet_bytes, associated_data)
            
            # Send: nonce (12 bytes) + ciphertext length (4 bytes) + ciphertext
            message = nonce + len(ciphertext).to_bytes(4, 'big') + ciphertext
            self._send_raw(message)
            
        except Exception as e:
            raise SecureChannelError(f"Failed to send data: {e}")
    
    def receive(self, timeout: Optional[float] = None) -> bytes:
        """
        Receive data from the secure channel.
        
        Args:
            timeout: Optional timeout in seconds
            
        Returns:
            Decrypted data bytes
            
        Raises:
            ChannelClosedError: If channel is not established
            SecureChannelError: If receive fails
            
        Requirements: 6.1
        """
        if not self.is_established or self.session_key is None:
            raise ChannelClosedError("Channel is not established")
        
        try:
            if timeout is not None:
                self.socket.settimeout(timeout)
            
            # Receive: nonce (12 bytes) + ciphertext length (4 bytes) + ciphertext
            nonce = self._recv_raw(12)
            ciphertext_len_bytes = self._recv_raw(4)
            ciphertext_len = int.from_bytes(ciphertext_len_bytes, 'big')
            
            if ciphertext_len > 10 * 1024 * 1024:  # 10 MB limit
                raise SecureChannelError("Ciphertext too large")
            
            ciphertext = self._recv_raw(ciphertext_len)
            
            # Decrypt with AEAD
            associated_data = f"COMMAND:{self.sequence_recv}".encode('utf-8')
            packet_bytes = decrypt_aead(self.session_key, ciphertext, nonce, associated_data)
            
            # Deserialize packet
            packet = deserialize_packet(packet_bytes)
            
            # Verify sequence number
            if packet.sequence != self.sequence_recv:
                raise SecureChannelError(f"Sequence mismatch: expected {self.sequence_recv}, got {packet.sequence}")
            
            self.sequence_recv += 1
            
            return packet.payload
            
        except socket.timeout:
            raise SecureChannelError("Receive timeout")
        except Exception as e:
            raise SecureChannelError(f"Failed to receive data: {e}")
        finally:
            if timeout is not None:
                self.socket.settimeout(None)
    
    def close(self) -> None:
        """
        Close the secure channel and clean up resources.
        
        Requirements: 6.1
        """
        self.is_established = False
        self.session_key = None
        
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
            self.socket = None
    
    def reconnect(self) -> bool:
        """
        Attempt to reconnect to the peer with exponential backoff.
        
        Returns:
            True if reconnection successful, False otherwise
            
        Requirements: 6.1
        """
        if self.peer_address is None:
            return False
        
        delay = self.reconnect_delay
        
        for attempt in range(self.max_reconnect_attempts):
            try:
                # Close existing connection
                self.close()
                
                # Wait before reconnecting
                if attempt > 0:
                    time.sleep(delay)
                    delay = min(delay * 2, self.max_reconnect_delay)
                
                # Attempt to establish connection
                self.establish(self.peer_address, is_initiator=True)
                return True
                
            except Exception:
                continue
        
        return False
    
    def _send_raw(self, data: bytes) -> None:
        """
        Send raw bytes over the socket.
        
        Args:
            data: Bytes to send
            
        Raises:
            ConnectionError: If send fails
        """
        if self.socket is None:
            raise ConnectionError("Socket is not connected")
        
        total_sent = 0
        while total_sent < len(data):
            sent = self.socket.send(data[total_sent:])
            if sent == 0:
                raise ConnectionError("Socket connection broken")
            total_sent += sent
    
    def _recv_raw(self, length: int) -> bytes:
        """
        Receive exact number of raw bytes from the socket.
        
        Args:
            length: Number of bytes to receive
            
        Returns:
            Received bytes
            
        Raises:
            ConnectionError: If receive fails
        """
        if self.socket is None:
            raise ConnectionError("Socket is not connected")
        
        data = b''
        while len(data) < length:
            chunk = self.socket.recv(length - len(data))
            if not chunk:
                raise ConnectionError("Socket connection broken")
            data += chunk
        
        return data
