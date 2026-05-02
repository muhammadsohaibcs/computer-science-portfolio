#!/usr/bin/env python3
"""
Command Authorization Server (CAS) Main Entry Point
Initializes and runs the CAS with configuration, gateway, and telemetry handler.
Handles graceful shutdown and cleanup.

Requirements: All
"""

import sys
import signal
import logging
import yaml
from pathlib import Path
from typing import Optional

from server.gateway import CommandGateway
from server.telemetry_handler import TelemetryHandler
from server.key_manager import get_key_manager
from server.replay_protection import NonceStore
from server.audit import log_event


class CASServer:
    """
    Main Command Authorization Server.
    
    Coordinates gateway, telemetry handler, and system services.
    """
    
    def __init__(self, config_path: str = "config/system_config.yaml"):
        """
        Initialize the CAS server.
        
        Args:
            config_path: Path to system configuration file
        """
        self.config = self._load_config(config_path)
        self.logger = self._setup_logging()
        self.running = False
        
        # Initialize components
        self.key_manager = None
        self.nonce_store = None
        self.gateway = None
        self.telemetry_handler = None
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _load_config(self, config_path: str) -> dict:
        """
        Load system configuration from YAML file.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Configuration dictionary
        """
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            return config
        except FileNotFoundError:
            print(f"Warning: Configuration file not found: {config_path}")
            print("Using default configuration")
            return self._default_config()
        except Exception as e:
            print(f"Error loading configuration: {e}")
            print("Using default configuration")
            return self._default_config()
    
    def _default_config(self) -> dict:
        """
        Get default configuration.
        
        Returns:
            Default configuration dictionary
        """
        return {
            'cas': {
                'host': 'localhost',
                'port': 8443
            },
            'audit': {
                'enabled': True,
                'log_file': 'data/audit_log.jsonl'
            },
            'logging': {
                'level': 'INFO',
                'log_file': 'logs/cas.log',
                'console_logging': True
            }
        }
    
    def _setup_logging(self) -> logging.Logger:
        """
        Setup logging configuration.
        
        Returns:
            Configured logger instance
        """
        log_config = self.config.get('logging', {})
        log_level = getattr(logging, log_config.get('level', 'INFO'))
        log_format = log_config.get(
            'format',
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Create logger
        logger = logging.getLogger('CAS')
        logger.setLevel(log_level)
        
        # Console handler
        if log_config.get('console_logging', True):
            console_handler = logging.StreamHandler()
            console_handler.setLevel(log_level)
            console_formatter = logging.Formatter(log_format)
            console_handler.setFormatter(console_formatter)
            logger.addHandler(console_handler)
        
        # File handler
        log_file = log_config.get('log_file')
        if log_file:
            # Create logs directory if it doesn't exist
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(log_level)
            file_formatter = logging.Formatter(log_format)
            file_handler.setFormatter(file_formatter)
            logger.addHandler(file_handler)
        
        return logger
    
    def initialize(self) -> bool:
        """
        Initialize CAS components.
        
        Returns:
            True if initialization successful, False otherwise
        """
        try:
            self.logger.info("Initializing Command Authorization Server...")
            
            # Initialize key manager
            self.logger.info("Initializing key manager...")
            self.key_manager = get_key_manager()
            
            # Initialize nonce store for replay protection
            self.logger.info("Initializing nonce store...")
            self.nonce_store = NonceStore()
            
            # Get audit log path from config
            audit_config = self.config.get('audit', {})
            audit_log_path = audit_config.get('log_file', 'data/audit_log.jsonl')
            
            # Ensure audit log directory exists
            audit_path = Path(audit_log_path)
            audit_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Initialize command gateway
            self.logger.info("Initializing command gateway...")
            self.gateway = CommandGateway(
                key_manager=self.key_manager,
                nonce_store=self.nonce_store,
                audit_log_path=audit_log_path
            )
            
            # Initialize telemetry handler
            self.logger.info("Initializing telemetry handler...")
            self.telemetry_handler = TelemetryHandler(
                key_manager=self.key_manager,
                audit_log_path=audit_log_path
            )
            
            # Log CAS startup
            log_event(
                event_type="CAS_STARTED",
                actor="SYSTEM",
                target="CAS",
                details={
                    "host": self.config.get('cas', {}).get('host', 'localhost'),
                    "port": self.config.get('cas', {}).get('port', 8443)
                },
                log_path=audit_log_path
            )
            
            self.logger.info("CAS initialization complete")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize CAS: {e}", exc_info=True)
            return False
    
    def start(self) -> None:
        """
        Start the CAS server.
        
        This starts the gateway and telemetry handler services.
        In a production system, this would start network listeners
        and background processing threads.
        """
        if not self.initialize():
            self.logger.error("CAS initialization failed. Exiting.")
            sys.exit(1)
        
        self.running = True
        cas_config = self.config.get('cas', {})
        host = cas_config.get('host', 'localhost')
        port = cas_config.get('port', 8443)
        
        self.logger.info(f"CAS server started on {host}:{port}")
        self.logger.info("Press Ctrl+C to stop the server")
        
        # In production, this would start network services
        # For now, we just keep the server running
        try:
            import time
            while self.running:
                # Main server loop
                # In production, this would handle incoming requests
                # Use time.sleep instead of signal.pause() for Windows compatibility
                time.sleep(1)
        except KeyboardInterrupt:
            self.logger.info("Received shutdown signal")
            self.shutdown()
    
    def shutdown(self) -> None:
        """
        Gracefully shutdown the CAS server.
        
        Performs cleanup operations:
        - Cleanup expired nonces
        - Flush audit logs
        - Close connections
        """
        if not self.running:
            return
        
        self.logger.info("Shutting down CAS server...")
        self.running = False
        
        try:
            # Cleanup nonce store
            if self.nonce_store:
                self.logger.info("Cleaning up nonce store...")
                self.nonce_store.cleanup_expired()
            
            # Log CAS shutdown
            audit_config = self.config.get('audit', {})
            audit_log_path = audit_config.get('log_file', 'data/audit_log.jsonl')
            
            log_event(
                event_type="CAS_STOPPED",
                actor="SYSTEM",
                target="CAS",
                details={"reason": "graceful_shutdown"},
                log_path=audit_log_path
            )
            
            self.logger.info("CAS server stopped")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}", exc_info=True)
    
    def _signal_handler(self, signum, frame):
        """
        Handle shutdown signals.
        
        Args:
            signum: Signal number
            frame: Current stack frame
        """
        self.logger.info(f"Received signal {signum}")
        self.shutdown()
        sys.exit(0)


def main():
    """
    Main entry point for CAS server.
    """
    # Parse command line arguments
    config_path = "config/system_config.yaml"
    if len(sys.argv) > 1:
        config_path = sys.argv[1]
    
    # Create and start CAS server
    cas = CASServer(config_path)
    cas.start()


if __name__ == "__main__":
    main()
