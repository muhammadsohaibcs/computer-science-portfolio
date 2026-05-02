"""
Blockchain Module
=================

This module implements a simplified blockchain for immutable
logging of IoT sensor data.

Purpose:
- Ensure data integrity
- Detect tampering
- Provide audit trail

This blockchain is used only for logging (not cryptocurrency).
"""

import hashlib
import json
from datetime import datetime


class Block:
    """
    Represents a single block in the blockchain.
    """

    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.compute_hash()

        print(f"[BLOCKCHAIN] Block #{self.index} created")

    def compute_hash(self):
        """
        Compute SHA-256 hash of block contents.
        """
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash
        }, sort_keys=True).encode()

        return hashlib.sha256(block_string).hexdigest()


class MessageBlockchain:
    """
    Manages the blockchain ledger.
    """

    def __init__(self):
        self.chain = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        """
        Create the first (genesis) block.
        """
        genesis = Block(
            index=0,
            timestamp=datetime.now().isoformat(),
            data={"message": "Genesis Block"},
            previous_hash="0"
        )
        self.chain.append(genesis)

        print("[BLOCKCHAIN] Genesis block created")

    # --------------------------------------------------
    # BLOCKCHAIN OPERATIONS
    # --------------------------------------------------

    def add_data(self, data):
        """
        Add new data as a block in the blockchain.
        """
        last_block = self.chain[-1]
        new_block = Block(
            index=len(self.chain),
            timestamp=datetime.now().isoformat(),
            data=data,
            previous_hash=last_block.hash
        )
        self.chain.append(new_block)

        print(f"[BLOCKCHAIN] Data added to block #{new_block.index}")
        return new_block

    def is_chain_valid(self):
        """
        Verify blockchain integrity.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            if current.previous_hash != previous.hash:
                print("[BLOCKCHAIN] Chain broken!")
                return False

            if current.hash != current.compute_hash():
                print("[BLOCKCHAIN] Invalid block hash detected!")
                return False

        print("[BLOCKCHAIN] Chain integrity verified")
        return True
