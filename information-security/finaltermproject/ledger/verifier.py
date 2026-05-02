"""
Ledger verifier module for SDRCAS.
Provides functions to verify the integrity of blocks and blockchain chains.
Ensures tamper-evidence and cryptographic integrity of the audit ledger.
"""

from typing import List, Tuple

from ledger.blockchain import Block
from core.hashing import hash_data


def verify_block(block: Block) -> Tuple[bool, str]:
    """
    Verify the integrity of a single block.
    
    Checks:
    1. Block hash is correctly computed
    2. All events in the block are properly formed
    
    Args:
        block: The block to verify
        
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if block is valid, False otherwise
        - error_message: Description of the error if invalid, empty string if valid
    """
    # Verify block hash
    computed_hash = block.compute_hash()
    if block.hash != computed_hash:
        return False, f"Block {block.index}: Hash mismatch. Expected {computed_hash.hex()}, got {block.hash.hex()}"
    
    # Verify all events have valid structure
    for i, event in enumerate(block.events):
        if not event.timestamp:
            return False, f"Block {block.index}, Event {i}: Missing timestamp"
        if not event.event_type:
            return False, f"Block {block.index}, Event {i}: Missing event_type"
        if not event.actor:
            return False, f"Block {block.index}, Event {i}: Missing actor"
        if not event.target:
            return False, f"Block {block.index}, Event {i}: Missing target"
        if event.details is None:
            return False, f"Block {block.index}, Event {i}: Missing details"
        if not event.previous_hash:
            return False, f"Block {block.index}, Event {i}: Missing previous_hash"
    
    return True, ""


def verify_chain_integrity(chain: List[Block]) -> Tuple[bool, str]:
    """
    Verify the integrity of an entire blockchain.
    
    Checks:
    1. All blocks are individually valid
    2. Block indices are sequential
    3. Each block's previous_hash matches the previous block's hash
    4. First block has genesis previous_hash (all zeros)
    
    Args:
        chain: List of blocks in order
        
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if chain is valid, False otherwise
        - error_message: Description of the error if invalid, empty string if valid
    """
    if not chain:
        # Empty chain is valid
        return True, ""
    
    # Verify first block has genesis previous_hash
    genesis_hash = b'\x00' * 32
    if chain[0].previous_hash != genesis_hash:
        return False, f"First block does not have genesis previous_hash. Got {chain[0].previous_hash.hex()}"
    
    # Verify each block individually and check linkage
    for i, block in enumerate(chain):
        # Verify block index is correct
        if block.index != i:
            return False, f"Block index mismatch at position {i}. Expected {i}, got {block.index}"
        
        # Verify individual block integrity
        is_valid, error_msg = verify_block(block)
        if not is_valid:
            return False, error_msg
        
        # Verify linkage to previous block (skip for first block)
        if i > 0:
            previous_block = chain[i - 1]
            if block.previous_hash != previous_block.hash:
                return False, (
                    f"Block {i}: previous_hash mismatch. "
                    f"Expected {previous_block.hash.hex()}, got {block.previous_hash.hex()}"
                )
    
    return True, ""


def verify_event_chain(blocks: List[Block]) -> Tuple[bool, str]:
    """
    Verify the hash chain of events across all blocks.
    
    Each event's previous_hash should chain to the previous event's hash,
    even across block boundaries.
    
    Args:
        blocks: List of blocks in order
        
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if event chain is valid, False otherwise
        - error_message: Description of the error if invalid, empty string if valid
    """
    if not blocks:
        return True, ""
    
    # Start with genesis hash
    expected_previous_hash = b'\x00' * 32
    
    for block_idx, block in enumerate(blocks):
        for event_idx, event in enumerate(block.events):
            # Verify event's previous_hash matches expected
            if event.previous_hash != expected_previous_hash:
                return False, (
                    f"Block {block_idx}, Event {event_idx}: "
                    f"Event hash chain broken. "
                    f"Expected previous_hash {expected_previous_hash.hex()}, "
                    f"got {event.previous_hash.hex()}"
                )
            
            # Compute this event's hash for next iteration
            expected_previous_hash = event.compute_hash()
    
    return True, ""


def verify_complete_ledger(chain: List[Block]) -> Tuple[bool, str]:
    """
    Perform complete verification of the ledger.
    
    This includes:
    1. Block chain integrity (verify_chain_integrity)
    2. Event chain integrity (verify_event_chain)
    
    Args:
        chain: List of blocks in order
        
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if ledger is completely valid, False otherwise
        - error_message: Description of the error if invalid, empty string if valid
    """
    # Verify block chain
    is_valid, error_msg = verify_chain_integrity(chain)
    if not is_valid:
        return False, f"Block chain verification failed: {error_msg}"
    
    # Verify event chain
    is_valid, error_msg = verify_event_chain(chain)
    if not is_valid:
        return False, f"Event chain verification failed: {error_msg}"
    
    return True, ""
