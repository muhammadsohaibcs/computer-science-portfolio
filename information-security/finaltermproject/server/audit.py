"""
Audit logging module for SDRCAS.
Provides immutable audit logging with hash chaining for tamper-evidence.
All system operations are logged to an append-only audit trail.
"""

import json
import os
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any
from pathlib import Path

from core.hashing import hash_data, hash_chain
from core.time_utils import get_current_timestamp


# Default audit log file location
DEFAULT_AUDIT_LOG_PATH = "data/audit_log.jsonl"


@dataclass
class AuditEvent:
    """
    Represents a single audit event in the system.
    Each event is hash-chained to the previous event for tamper-evidence.
    """
    timestamp: int
    event_type: str
    actor: str
    target: str
    details: Dict[str, Any]
    previous_hash: bytes
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert AuditEvent to dictionary for serialization."""
        return {
            'timestamp': self.timestamp,
            'event_type': self.event_type,
            'actor': self.actor,
            'target': self.target,
            'details': self.details,
            'previous_hash': self.previous_hash.hex()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AuditEvent':
        """Create AuditEvent from dictionary."""
        return cls(
            timestamp=data['timestamp'],
            event_type=data['event_type'],
            actor=data['actor'],
            target=data['target'],
            details=data['details'],
            previous_hash=bytes.fromhex(data['previous_hash'])
        )
    
    def compute_hash(self) -> bytes:
        """
        Compute the hash of this audit event.
        Used for chaining to the next event.
        """
        # Serialize event data (excluding the hash itself)
        event_data = {
            'timestamp': self.timestamp,
            'event_type': self.event_type,
            'actor': self.actor,
            'target': self.target,
            'details': self.details,
            'previous_hash': self.previous_hash.hex()
        }
        serialized = json.dumps(event_data, sort_keys=True).encode('utf-8')
        return hash_data(serialized)


class AuditLogger:
    """
    Manages the audit log with hash chaining for tamper-evidence.
    Provides append-only logging to ensure immutability.
    """
    
    def __init__(self, log_path: Optional[str] = None):
        """
        Initialize the audit logger.
        
        Args:
            log_path: Path to the audit log file (default: DEFAULT_AUDIT_LOG_PATH)
        """
        self.log_path = log_path or DEFAULT_AUDIT_LOG_PATH
        self._ensure_log_directory()
        self._last_hash = self._load_last_hash()
    
    def _ensure_log_directory(self) -> None:
        """Ensure the directory for the audit log exists."""
        log_dir = os.path.dirname(self.log_path)
        if log_dir:
            Path(log_dir).mkdir(parents=True, exist_ok=True)
    
    def _load_last_hash(self) -> bytes:
        """
        Load the hash of the last event in the audit log.
        Returns genesis hash (all zeros) if log is empty.
        """
        if not os.path.exists(self.log_path):
            # Genesis hash for the first event
            return b'\x00' * 32
        
        try:
            with open(self.log_path, 'r') as f:
                # Read the last line
                lines = f.readlines()
                if not lines:
                    return b'\x00' * 32
                
                last_line = lines[-1].strip()
                if not last_line:
                    return b'\x00' * 32
                
                last_event_data = json.loads(last_line)
                last_event = AuditEvent.from_dict(last_event_data)
                return last_event.compute_hash()
        except (json.JSONDecodeError, KeyError, IOError) as e:
            # If we can't read the last hash, start fresh
            # In production, this should trigger an alert
            print(f"Warning: Could not load last hash from audit log: {e}")
            return b'\x00' * 32
    
    def log_event(
        self,
        event_type: str,
        actor: str,
        target: str,
        details: Dict[str, Any]
    ) -> AuditEvent:
        """
        Log an audit event with hash chaining.
        
        Args:
            event_type: Type of event (e.g., "COMMAND_REQUESTED", "COMMAND_AUTHORIZED")
            actor: Entity performing the action (e.g., operator ID)
            target: Entity being acted upon (e.g., drone ID)
            details: Additional event details
            
        Returns:
            The created AuditEvent
        """
        # Create the audit event
        event = AuditEvent(
            timestamp=get_current_timestamp(),
            event_type=event_type,
            actor=actor,
            target=target,
            details=details,
            previous_hash=self._last_hash
        )
        
        # Append to log file (append-only)
        try:
            with open(self.log_path, 'a') as f:
                f.write(json.dumps(event.to_dict()) + '\n')
        except IOError as e:
            # In production, this should trigger an alert
            print(f"Error: Failed to write audit event: {e}")
            raise
        
        # Update last hash for next event
        self._last_hash = event.compute_hash()
        
        return event


def log_event(
    event_type: str,
    actor: str,
    target: str,
    details: Dict[str, Any],
    log_path: Optional[str] = None
) -> AuditEvent:
    """
    Convenience function to log an audit event.
    Creates a new AuditLogger instance for each call.
    
    Args:
        event_type: Type of event
        actor: Entity performing the action
        target: Entity being acted upon
        details: Additional event details
        log_path: Optional custom log path
        
    Returns:
        The created AuditEvent
    """
    logger = AuditLogger(log_path)
    return logger.log_event(event_type, actor, target, details)


def verify_audit_chain(log_path: Optional[str] = None) -> bool:
    """
    Verify the integrity of the audit log hash chain.
    
    Args:
        log_path: Path to the audit log file
        
    Returns:
        True if the chain is valid, False if tampered
    """
    log_path = log_path or DEFAULT_AUDIT_LOG_PATH
    
    if not os.path.exists(log_path):
        # Empty log is valid
        return True
    
    try:
        with open(log_path, 'r') as f:
            lines = f.readlines()
        
        if not lines:
            return True
        
        # Start with genesis hash
        expected_previous_hash = b'\x00' * 32
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            event_data = json.loads(line)
            event = AuditEvent.from_dict(event_data)
            
            # Verify the previous hash matches
            if event.previous_hash != expected_previous_hash:
                return False
            
            # Compute hash for next iteration
            expected_previous_hash = event.compute_hash()
        
        return True
    
    except (json.JSONDecodeError, KeyError, IOError) as e:
        print(f"Error verifying audit chain: {e}")
        return False


def query_audit_log(
    filters: Optional[Dict[str, Any]] = None,
    log_path: Optional[str] = None
) -> List[AuditEvent]:
    """
    Query the audit log with optional filters.
    
    Args:
        filters: Dictionary of filters to apply:
            - event_type: Filter by event type
            - actor: Filter by actor
            - target: Filter by target
            - start_time: Filter events after this timestamp
            - end_time: Filter events before this timestamp
        log_path: Path to the audit log file
        
    Returns:
        List of matching AuditEvents
    """
    log_path = log_path or DEFAULT_AUDIT_LOG_PATH
    filters = filters or {}
    
    if not os.path.exists(log_path):
        return []
    
    results = []
    
    try:
        with open(log_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                event_data = json.loads(line)
                event = AuditEvent.from_dict(event_data)
                
                # Apply filters
                if 'event_type' in filters and event.event_type != filters['event_type']:
                    continue
                if 'actor' in filters and event.actor != filters['actor']:
                    continue
                if 'target' in filters and event.target != filters['target']:
                    continue
                if 'start_time' in filters and event.timestamp < filters['start_time']:
                    continue
                if 'end_time' in filters and event.timestamp > filters['end_time']:
                    continue
                
                results.append(event)
        
        return results
    
    except (json.JSONDecodeError, KeyError, IOError) as e:
        print(f"Error querying audit log: {e}")
        return []
