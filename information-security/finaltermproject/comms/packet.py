"""
Packet module for SDRCAS communication layer.
Implements packet data structure and serialization for different packet types.
"""

import json
from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class Packet:
    """
    Packet data structure for communication between system components.
    
    Attributes:
        packet_type: Type of packet (COMMAND, TELEMETRY, ACK, HANDSHAKE)
        payload: Packet payload as bytes
        sequence: Sequence number for ordering and duplicate detection
        source_id: Optional identifier of the packet source
        target_id: Optional identifier of the packet target
    
    Requirements: 15.3
    """
    packet_type: str
    payload: bytes
    sequence: int
    source_id: Optional[str] = None
    target_id: Optional[str] = None
    
    def __post_init__(self):
        """Validate packet fields."""
        valid_types = ["COMMAND", "TELEMETRY", "ACK", "HANDSHAKE", "ERROR"]
        if self.packet_type not in valid_types:
            raise ValueError(f"Invalid packet_type: {self.packet_type}. Must be one of {valid_types}")
        
        if not isinstance(self.payload, bytes):
            raise TypeError("Payload must be bytes")
        
        if not isinstance(self.sequence, int) or self.sequence < 0:
            raise ValueError("Sequence must be a non-negative integer")


def create_packet(packet_type: str, payload: bytes, sequence: int = 0, 
                  source_id: Optional[str] = None, target_id: Optional[str] = None) -> Packet:
    """
    Create a new packet with the specified type and payload.
    
    Args:
        packet_type: Type of packet (COMMAND, TELEMETRY, ACK, HANDSHAKE, ERROR)
        payload: Packet payload as bytes
        sequence: Sequence number (default: 0)
        source_id: Optional source identifier
        target_id: Optional target identifier
        
    Returns:
        Packet object
        
    Raises:
        ValueError: If packet_type is invalid or sequence is negative
        TypeError: If payload is not bytes
        
    Requirements: 15.3
    """
    return Packet(
        packet_type=packet_type,
        payload=payload,
        sequence=sequence,
        source_id=source_id,
        target_id=target_id
    )


def serialize_packet(packet: Packet) -> bytes:
    """
    Serialize a packet to bytes for transmission.
    
    The packet is serialized as JSON with the following structure:
    {
        "packet_type": str,
        "payload": base64-encoded bytes,
        "sequence": int,
        "source_id": str or null,
        "target_id": str or null
    }
    
    Args:
        packet: Packet to serialize
        
    Returns:
        Serialized packet as bytes
        
    Requirements: 15.3
    """
    import base64
    
    # Convert packet to dictionary
    packet_dict = {
        "packet_type": packet.packet_type,
        "payload": base64.b64encode(packet.payload).decode('ascii'),
        "sequence": packet.sequence,
        "source_id": packet.source_id,
        "target_id": packet.target_id
    }
    
    # Serialize to JSON bytes
    json_str = json.dumps(packet_dict, separators=(',', ':'))
    return json_str.encode('utf-8')


def deserialize_packet(data: bytes) -> Packet:
    """
    Deserialize a packet from bytes.
    
    Args:
        data: Serialized packet bytes
        
    Returns:
        Packet object
        
    Raises:
        ValueError: If data is malformed or contains invalid packet structure
        json.JSONDecodeError: If data is not valid JSON
        
    Requirements: 15.3
    """
    import base64
    
    if not isinstance(data, bytes):
        raise TypeError("Data must be bytes")
    
    # Parse JSON
    try:
        json_str = data.decode('utf-8')
        packet_dict = json.loads(json_str)
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        raise ValueError(f"Failed to parse packet data: {e}")
    
    # Validate required fields
    required_fields = ["packet_type", "payload", "sequence"]
    for field in required_fields:
        if field not in packet_dict:
            raise ValueError(f"Missing required field: {field}")
    
    # Decode payload from base64
    try:
        payload = base64.b64decode(packet_dict["payload"])
    except Exception as e:
        raise ValueError(f"Failed to decode payload: {e}")
    
    # Create packet
    return Packet(
        packet_type=packet_dict["packet_type"],
        payload=payload,
        sequence=packet_dict["sequence"],
        source_id=packet_dict.get("source_id"),
        target_id=packet_dict.get("target_id")
    )
