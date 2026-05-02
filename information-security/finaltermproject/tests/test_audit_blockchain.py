"""
Unit tests for audit logging and blockchain modules.
Tests audit event logging, hash chaining, blockchain integrity, and verification.
"""

import pytest
import os
import tempfile
import json
from pathlib import Path

from server.audit import (
    AuditEvent,
    AuditLogger,
    log_event,
    verify_audit_chain,
    query_audit_log
)
from ledger.blockchain import Block, Blockchain
from ledger.verifier import (
    verify_block,
    verify_chain_integrity,
    verify_event_chain,
    verify_complete_ledger
)
from core.time_utils import get_current_timestamp


# Fixtures for temporary files
@pytest.fixture
def temp_audit_log():
    """Create a temporary audit log file."""
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.jsonl') as f:
        temp_path = f.name
    yield temp_path
    # Cleanup
    if os.path.exists(temp_path):
        os.unlink(temp_path)


@pytest.fixture
def temp_blockchain():
    """Create a temporary blockchain file."""
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.jsonl') as f:
        temp_path = f.name
    yield temp_path
    # Cleanup
    if os.path.exists(temp_path):
        os.unlink(temp_path)


# AuditEvent tests
def test_audit_event_creation():
    """Test creating an audit event."""
    event = AuditEvent(
        timestamp=get_current_timestamp(),
        event_type="COMMAND_REQUESTED",
        actor="OPERATOR_01",
        target="DRONE_01",
        details={"command": "MOVE", "coordinates": [10, 20]},
        previous_hash=b'\x00' * 32
    )
    
    assert event.timestamp > 0
    assert event.event_type == "COMMAND_REQUESTED"
    assert event.actor == "OPERATOR_01"
    assert event.target == "DRONE_01"
    assert event.details["command"] == "MOVE"


def test_audit_event_serialization():
    """Test audit event serialization round-trip."""
    event = AuditEvent(
        timestamp=1234567890,
        event_type="COMMAND_AUTHORIZED",
        actor="CAS",
        target="DRONE_02",
        details={"authorized": True},
        previous_hash=b'\xaa' * 32
    )
    
    # Serialize
    event_dict = event.to_dict()
    assert event_dict['timestamp'] == 1234567890
    assert event_dict['event_type'] == "COMMAND_AUTHORIZED"
    
    # Deserialize
    restored_event = AuditEvent.from_dict(event_dict)
    assert restored_event.timestamp == event.timestamp
    assert restored_event.event_type == event.event_type
    assert restored_event.actor == event.actor
    assert restored_event.target == event.target
    assert restored_event.details == event.details
    assert restored_event.previous_hash == event.previous_hash


def test_audit_event_compute_hash():
    """Test that audit event hash computation is deterministic."""
    event = AuditEvent(
        timestamp=1234567890,
        event_type="TEST",
        actor="ACTOR",
        target="TARGET",
        details={"key": "value"},
        previous_hash=b'\x00' * 32
    )
    
    hash1 = event.compute_hash()
    hash2 = event.compute_hash()
    
    assert hash1 == hash2
    assert len(hash1) == 32  # SHA-256 produces 32 bytes


# AuditLogger tests
def test_audit_logger_initialization(temp_audit_log):
    """Test audit logger initialization."""
    logger = AuditLogger(temp_audit_log)
    assert logger.log_path == temp_audit_log
    assert os.path.exists(os.path.dirname(temp_audit_log))


def test_audit_logger_log_event(temp_audit_log):
    """Test logging an event."""
    logger = AuditLogger(temp_audit_log)
    
    event = logger.log_event(
        event_type="COMMAND_REQUESTED",
        actor="OPERATOR_01",
        target="DRONE_01",
        details={"command": "LAND"}
    )
    
    assert event.event_type == "COMMAND_REQUESTED"
    assert event.actor == "OPERATOR_01"
    assert event.target == "DRONE_01"
    assert os.path.exists(temp_audit_log)


def test_audit_logger_hash_chaining(temp_audit_log):
    """Test that events are properly hash-chained."""
    logger = AuditLogger(temp_audit_log)
    
    # Log first event
    event1 = logger.log_event(
        event_type="EVENT_1",
        actor="ACTOR_1",
        target="TARGET_1",
        details={}
    )
    
    # First event should have genesis hash
    assert event1.previous_hash == b'\x00' * 32
    
    # Log second event
    event2 = logger.log_event(
        event_type="EVENT_2",
        actor="ACTOR_2",
        target="TARGET_2",
        details={}
    )
    
    # Second event's previous_hash should be first event's hash
    assert event2.previous_hash == event1.compute_hash()


def test_log_event_convenience_function(temp_audit_log):
    """Test the convenience log_event function."""
    event = log_event(
        event_type="TEST_EVENT",
        actor="TEST_ACTOR",
        target="TEST_TARGET",
        details={"test": True},
        log_path=temp_audit_log
    )
    
    assert event.event_type == "TEST_EVENT"
    assert os.path.exists(temp_audit_log)


def test_verify_audit_chain_valid(temp_audit_log):
    """Test verifying a valid audit chain."""
    logger = AuditLogger(temp_audit_log)
    
    # Log multiple events
    for i in range(5):
        logger.log_event(
            event_type=f"EVENT_{i}",
            actor=f"ACTOR_{i}",
            target=f"TARGET_{i}",
            details={"index": i}
        )
    
    # Verify chain
    assert verify_audit_chain(temp_audit_log) is True


def test_verify_audit_chain_empty(temp_audit_log):
    """Test verifying an empty audit chain."""
    # Empty log should be valid
    assert verify_audit_chain(temp_audit_log) is True


def test_query_audit_log(temp_audit_log):
    """Test querying the audit log."""
    logger = AuditLogger(temp_audit_log)
    
    # Log events
    logger.log_event("EVENT_A", "ACTOR_1", "TARGET_1", {})
    logger.log_event("EVENT_B", "ACTOR_2", "TARGET_1", {})
    logger.log_event("EVENT_A", "ACTOR_1", "TARGET_2", {})
    
    # Query by event type
    results = query_audit_log({"event_type": "EVENT_A"}, temp_audit_log)
    assert len(results) == 2
    assert all(e.event_type == "EVENT_A" for e in results)
    
    # Query by actor
    results = query_audit_log({"actor": "ACTOR_1"}, temp_audit_log)
    assert len(results) == 2
    assert all(e.actor == "ACTOR_1" for e in results)
    
    # Query by target
    results = query_audit_log({"target": "TARGET_1"}, temp_audit_log)
    assert len(results) == 2
    assert all(e.target == "TARGET_1" for e in results)


# Block tests
def test_block_creation():
    """Test creating a block."""
    events = [
        AuditEvent(
            timestamp=get_current_timestamp(),
            event_type="EVENT_1",
            actor="ACTOR_1",
            target="TARGET_1",
            details={},
            previous_hash=b'\x00' * 32
        )
    ]
    
    block = Block(
        index=0,
        timestamp=get_current_timestamp(),
        events=events,
        previous_hash=b'\x00' * 32,
        hash=b'\x00' * 32
    )
    
    assert block.index == 0
    assert len(block.events) == 1


def test_block_serialization():
    """Test block serialization round-trip."""
    events = [
        AuditEvent(
            timestamp=1234567890,
            event_type="TEST",
            actor="ACTOR",
            target="TARGET",
            details={"key": "value"},
            previous_hash=b'\x00' * 32
        )
    ]
    
    block = Block(
        index=0,
        timestamp=1234567890,
        events=events,
        previous_hash=b'\x00' * 32,
        hash=b'\xaa' * 32
    )
    
    # Serialize
    block_dict = block.to_dict()
    
    # Deserialize
    restored_block = Block.from_dict(block_dict)
    assert restored_block.index == block.index
    assert restored_block.timestamp == block.timestamp
    assert len(restored_block.events) == len(block.events)
    assert restored_block.previous_hash == block.previous_hash
    assert restored_block.hash == block.hash


def test_block_compute_hash():
    """Test that block hash computation is deterministic."""
    events = [
        AuditEvent(
            timestamp=1234567890,
            event_type="TEST",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=b'\x00' * 32
        )
    ]
    
    block = Block(
        index=0,
        timestamp=1234567890,
        events=events,
        previous_hash=b'\x00' * 32,
        hash=b'\x00' * 32
    )
    
    hash1 = block.compute_hash()
    hash2 = block.compute_hash()
    
    assert hash1 == hash2
    assert len(hash1) == 32


# Blockchain tests
def test_blockchain_initialization(temp_blockchain):
    """Test blockchain initialization."""
    blockchain = Blockchain(temp_blockchain, block_size=5)
    assert blockchain.blockchain_path == temp_blockchain
    assert blockchain.block_size == 5


def test_blockchain_add_event(temp_blockchain):
    """Test adding events to blockchain."""
    blockchain = Blockchain(temp_blockchain, block_size=3)
    
    event = AuditEvent(
        timestamp=get_current_timestamp(),
        event_type="TEST",
        actor="ACTOR",
        target="TARGET",
        details={},
        previous_hash=b'\x00' * 32
    )
    
    blockchain.add_event(event)
    assert len(blockchain._pending_events) == 1


def test_blockchain_block_creation(temp_blockchain):
    """Test that blocks are created when block_size is reached."""
    blockchain = Blockchain(temp_blockchain, block_size=2)
    
    # Add events
    for i in range(3):
        event = AuditEvent(
            timestamp=get_current_timestamp(),
            event_type=f"EVENT_{i}",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=b'\x00' * 32
        )
        blockchain.add_event(event)
    
    # Should have created one block (first 2 events)
    assert blockchain.get_block_count() == 1
    # One event should be pending
    assert len(blockchain._pending_events) == 1


def test_blockchain_flush(temp_blockchain):
    """Test flushing pending events."""
    blockchain = Blockchain(temp_blockchain, block_size=10)
    
    # Add fewer events than block_size
    for i in range(3):
        event = AuditEvent(
            timestamp=get_current_timestamp(),
            event_type=f"EVENT_{i}",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=b'\x00' * 32
        )
        blockchain.add_event(event)
    
    # No blocks should be created yet
    assert blockchain.get_block_count() == 0
    
    # Flush
    blockchain.flush()
    
    # Now block should be created
    assert blockchain.get_block_count() == 1
    assert len(blockchain._pending_events) == 0


def test_blockchain_verify_chain(temp_blockchain):
    """Test verifying blockchain integrity."""
    blockchain = Blockchain(temp_blockchain, block_size=2)
    
    # Add events
    for i in range(5):
        event = AuditEvent(
            timestamp=get_current_timestamp(),
            event_type=f"EVENT_{i}",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=b'\x00' * 32
        )
        blockchain.add_event(event)
    
    blockchain.flush()
    
    # Verify chain
    assert blockchain.verify_chain() is True


def test_blockchain_get_events(temp_blockchain):
    """Test getting events from blockchain."""
    blockchain = Blockchain(temp_blockchain, block_size=2)
    
    # Add events with different timestamps
    base_time = get_current_timestamp()
    for i in range(5):
        event = AuditEvent(
            timestamp=base_time + i,
            event_type=f"EVENT_{i}",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=b'\x00' * 32
        )
        blockchain.add_event(event)
    
    blockchain.flush()
    
    # Get all events
    all_events = blockchain.get_events()
    assert len(all_events) == 5
    
    # Get events in time range
    filtered_events = blockchain.get_events(
        start_time=base_time + 1,
        end_time=base_time + 3
    )
    assert len(filtered_events) == 3


# Verifier tests
def test_verify_block_valid():
    """Test verifying a valid block."""
    events = [
        AuditEvent(
            timestamp=get_current_timestamp(),
            event_type="TEST",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=b'\x00' * 32
        )
    ]
    
    block = Block(
        index=0,
        timestamp=get_current_timestamp(),
        events=events,
        previous_hash=b'\x00' * 32,
        hash=b'\x00' * 32
    )
    block.hash = block.compute_hash()
    
    is_valid, error_msg = verify_block(block)
    assert is_valid is True
    assert error_msg == ""


def test_verify_block_invalid_hash():
    """Test verifying a block with invalid hash."""
    events = [
        AuditEvent(
            timestamp=get_current_timestamp(),
            event_type="TEST",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=b'\x00' * 32
        )
    ]
    
    block = Block(
        index=0,
        timestamp=get_current_timestamp(),
        events=events,
        previous_hash=b'\x00' * 32,
        hash=b'\xff' * 32  # Wrong hash
    )
    
    is_valid, error_msg = verify_block(block)
    assert is_valid is False
    assert "Hash mismatch" in error_msg


def test_verify_chain_integrity_valid():
    """Test verifying a valid chain."""
    # Create a chain of blocks
    blocks = []
    previous_hash = b'\x00' * 32
    
    for i in range(3):
        events = [
            AuditEvent(
                timestamp=get_current_timestamp(),
                event_type=f"EVENT_{i}",
                actor="ACTOR",
                target="TARGET",
                details={},
                previous_hash=b'\x00' * 32
            )
        ]
        
        block = Block(
            index=i,
            timestamp=get_current_timestamp(),
            events=events,
            previous_hash=previous_hash,
            hash=b'\x00' * 32
        )
        block.hash = block.compute_hash()
        blocks.append(block)
        previous_hash = block.hash
    
    is_valid, error_msg = verify_chain_integrity(blocks)
    assert is_valid is True
    assert error_msg == ""


def test_verify_chain_integrity_broken_link():
    """Test verifying a chain with broken link."""
    # Create blocks with broken linkage
    block1 = Block(
        index=0,
        timestamp=get_current_timestamp(),
        events=[],
        previous_hash=b'\x00' * 32,
        hash=b'\x00' * 32
    )
    block1.hash = block1.compute_hash()
    
    block2 = Block(
        index=1,
        timestamp=get_current_timestamp(),
        events=[],
        previous_hash=b'\xff' * 32,  # Wrong previous hash
        hash=b'\x00' * 32
    )
    block2.hash = block2.compute_hash()
    
    is_valid, error_msg = verify_chain_integrity([block1, block2])
    assert is_valid is False
    assert "previous_hash mismatch" in error_msg


def test_verify_complete_ledger(temp_blockchain):
    """Test complete ledger verification."""
    blockchain = Blockchain(temp_blockchain, block_size=2)
    
    # Create a proper event chain
    previous_hash = b'\x00' * 32
    for i in range(5):
        event = AuditEvent(
            timestamp=get_current_timestamp(),
            event_type=f"EVENT_{i}",
            actor="ACTOR",
            target="TARGET",
            details={},
            previous_hash=previous_hash
        )
        blockchain.add_event(event)
        previous_hash = event.compute_hash()
    
    blockchain.flush()
    
    # Load blocks and verify
    blocks = []
    with open(temp_blockchain, 'r') as f:
        for line in f:
            if line.strip():
                block_data = json.loads(line)
                blocks.append(Block.from_dict(block_data))
    
    is_valid, error_msg = verify_complete_ledger(blocks)
    assert is_valid is True
    assert error_msg == ""
