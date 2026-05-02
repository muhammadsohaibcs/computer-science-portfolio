"""
Blockchain module for SDRCAS audit ledger.
Provides a blockchain structure for tamper-evident audit logging.
Each block contains multiple audit events and is cryptographically linked to the previous block.
"""

import json
import os
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from pathlib import Path

from core.hashing import hash_data
from core.time_utils import get_current_timestamp
from server.audit import AuditEvent


# Default blockchain storage path
DEFAULT_BLOCKCHAIN_PATH = "data/blockchain.jsonl"


@dataclass
class Block:
    """
    Represents a block in the blockchain.
    Each block contains multiple audit events and is linked to the previous block.
    """
    index: int
    timestamp: int
    events: List[AuditEvent]
    previous_hash: bytes
    hash: bytes
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert Block to dictionary for serialization."""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'events': [event.to_dict() for event in self.events],
            'previous_hash': self.previous_hash.hex(),
            'hash': self.hash.hex()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Block':
        """Create Block from dictionary."""
        return cls(
            index=data['index'],
            timestamp=data['timestamp'],
            events=[AuditEvent.from_dict(e) for e in data['events']],
            previous_hash=bytes.fromhex(data['previous_hash']),
            hash=bytes.fromhex(data['hash'])
        )
    
    def compute_hash(self) -> bytes:
        """
        Compute the hash of this block.
        The hash includes the block index, timestamp, all events, and previous hash.
        """
        block_data = {
            'index': self.index,
            'timestamp': self.timestamp,
            'events': [event.to_dict() for event in self.events],
            'previous_hash': self.previous_hash.hex()
        }
        serialized = json.dumps(block_data, sort_keys=True).encode('utf-8')
        return hash_data(serialized)


class Blockchain:
    """
    Manages a blockchain of audit events for tamper-evident logging.
    Provides methods to add events, verify chain integrity, and query events.
    """
    
    def __init__(
        self,
        blockchain_path: Optional[str] = None,
        block_size: int = 10
    ):
        """
        Initialize the blockchain.
        
        Args:
            blockchain_path: Path to the blockchain storage file
            block_size: Number of events per block (default: 10)
        """
        self.blockchain_path = blockchain_path or DEFAULT_BLOCKCHAIN_PATH
        self.block_size = block_size
        self._ensure_blockchain_directory()
        self._pending_events: List[AuditEvent] = []
        self._last_block = self._load_last_block()
    
    def _ensure_blockchain_directory(self) -> None:
        """Ensure the directory for the blockchain exists."""
        blockchain_dir = os.path.dirname(self.blockchain_path)
        if blockchain_dir:
            Path(blockchain_dir).mkdir(parents=True, exist_ok=True)
    
    def _load_last_block(self) -> Optional[Block]:
        """
        Load the last block from the blockchain.
        Returns None if blockchain is empty.
        """
        if not os.path.exists(self.blockchain_path):
            return None
        
        try:
            with open(self.blockchain_path, 'r') as f:
                lines = f.readlines()
                if not lines:
                    return None
                
                last_line = lines[-1].strip()
                if not last_line:
                    return None
                
                last_block_data = json.loads(last_line)
                return Block.from_dict(last_block_data)
        except (json.JSONDecodeError, KeyError, IOError) as e:
            print(f"Warning: Could not load last block: {e}")
            return None
    
    def _create_genesis_block(self) -> Block:
        """
        Create the genesis block (first block in the chain).
        """
        genesis_block = Block(
            index=0,
            timestamp=get_current_timestamp(),
            events=[],
            previous_hash=b'\x00' * 32,
            hash=b'\x00' * 32  # Placeholder, will be computed
        )
        genesis_block.hash = genesis_block.compute_hash()
        return genesis_block
    
    def _create_block(self, events: List[AuditEvent]) -> Block:
        """
        Create a new block with the given events.
        
        Args:
            events: List of audit events to include in the block
            
        Returns:
            The created Block
        """
        if self._last_block is None:
            # Create genesis block if this is the first block
            previous_hash = b'\x00' * 32
            index = 0
        else:
            previous_hash = self._last_block.hash
            index = self._last_block.index + 1
        
        block = Block(
            index=index,
            timestamp=get_current_timestamp(),
            events=events,
            previous_hash=previous_hash,
            hash=b'\x00' * 32  # Placeholder
        )
        block.hash = block.compute_hash()
        return block
    
    def _write_block(self, block: Block) -> None:
        """
        Write a block to the blockchain file.
        
        Args:
            block: The block to write
        """
        try:
            with open(self.blockchain_path, 'a') as f:
                f.write(json.dumps(block.to_dict()) + '\n')
        except IOError as e:
            print(f"Error: Failed to write block: {e}")
            raise
    
    def add_event(self, event: AuditEvent) -> None:
        """
        Add an audit event to the blockchain.
        Events are batched into blocks of size block_size.
        
        Args:
            event: The audit event to add
        """
        self._pending_events.append(event)
        
        # Create a new block when we have enough events
        if len(self._pending_events) >= self.block_size:
            self._finalize_block()
    
    def _finalize_block(self) -> None:
        """
        Finalize the current pending events into a block.
        """
        if not self._pending_events:
            return
        
        block = self._create_block(self._pending_events)
        self._write_block(block)
        self._last_block = block
        self._pending_events = []
    
    def flush(self) -> None:
        """
        Flush any pending events to a block.
        Useful for ensuring all events are persisted.
        """
        if self._pending_events:
            self._finalize_block()
    
    def verify_chain(self) -> bool:
        """
        Verify the integrity of the entire blockchain.
        
        Returns:
            True if the chain is valid, False if tampered
        """
        if not os.path.exists(self.blockchain_path):
            # Empty blockchain is valid
            return True
        
        try:
            with open(self.blockchain_path, 'r') as f:
                lines = f.readlines()
            
            if not lines:
                return True
            
            previous_hash = b'\x00' * 32
            expected_index = 0
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                block_data = json.loads(line)
                block = Block.from_dict(block_data)
                
                # Verify block index is sequential
                if block.index != expected_index:
                    return False
                
                # Verify previous hash matches
                if block.previous_hash != previous_hash:
                    return False
                
                # Verify block hash is correct
                computed_hash = block.compute_hash()
                if block.hash != computed_hash:
                    return False
                
                # Update for next iteration
                previous_hash = block.hash
                expected_index += 1
            
            return True
        
        except (json.JSONDecodeError, KeyError, IOError) as e:
            print(f"Error verifying blockchain: {e}")
            return False
    
    def get_events(
        self,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> List[AuditEvent]:
        """
        Get all events in the blockchain within a time range.
        
        Args:
            start_time: Optional start timestamp (inclusive)
            end_time: Optional end timestamp (inclusive)
            
        Returns:
            List of AuditEvents matching the time range
        """
        if not os.path.exists(self.blockchain_path):
            return []
        
        results = []
        
        try:
            with open(self.blockchain_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    block_data = json.loads(line)
                    block = Block.from_dict(block_data)
                    
                    for event in block.events:
                        # Apply time filters
                        if start_time is not None and event.timestamp < start_time:
                            continue
                        if end_time is not None and event.timestamp > end_time:
                            continue
                        
                        results.append(event)
            
            return results
        
        except (json.JSONDecodeError, KeyError, IOError) as e:
            print(f"Error getting events from blockchain: {e}")
            return []
    
    def get_block_count(self) -> int:
        """
        Get the total number of blocks in the blockchain.
        
        Returns:
            Number of blocks
        """
        if not os.path.exists(self.blockchain_path):
            return 0
        
        try:
            with open(self.blockchain_path, 'r') as f:
                return sum(1 for line in f if line.strip())
        except IOError:
            return 0
