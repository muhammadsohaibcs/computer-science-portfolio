#!/usr/bin/env python3
"""
Drone Agent Main Entry Point
Initializes and runs a drone agent with provisioned keys.
Connects to CAS, listens for commands, and handles failsafe conditions.

Requirements: All
"""

import sys
import signal
import logging
import yaml
import time
from pathlib import Path
from typing import Optional, Dict, Any

from drone.agent import DroneAgent
from drone.failsafe import FailsafeConditions
from drone.secure_storage import SecureKeyStorage


class DroneRunner:
    """
    Main drone runner that manages the drone agent lifecycle.
    
    Handles initialization, connection to CAS, command reception,
    and graceful shutdown.
    """
    
    def __init__(
        self,
        drone_id: str,
        password: str,
        config_path: str = "config/system_config.yaml"
    ):
        """
        Initialize the drone runner.
        
        Args:
            drone_id: Unique identifier for this drone
            password: Password to decrypt the drone's private key
            config_path: Path to system configuration file
        """
        self.drone_id = drone_id
        self.password = password
        self.config = self._load_config(config_path)
        self.logger = self._setup_logging()
        self.running = False
        self.agent: Optional[DroneAgent] = None
        
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
            'failsafe': {
                'max_invalid_commands': 5,
                'communication_timeout': 120,
                'default_behavior': 'hover'
            },
            'logging': {
                'level': 'INFO',
                'log_file': f'logs/drone_{self.drone_id}.log',
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
        logger = logging.getLogger(f'Drone-{self.drone_id}')
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
        Initialize the drone agent with provisioned keys.
        
        Returns:
            True if initialization successful, False otherwise
        """
        try:
            self.logger.info(f"Initializing Drone Agent {self.drone_id}...")
            
            # Verify that keys exist
            key_storage = SecureKeyStorage()
            if not key_storage.key_exists(self.drone_id):
                self.logger.error(
                    f"Private key not found for drone {self.drone_id}. "
                    "Please run provisioning first."
                )
                return False
            
            # Determine CAS public key path
            cas_public_key_path = self._get_cas_public_key_path()
            if not Path(cas_public_key_path).exists():
                self.logger.error(
                    f"CAS public key not found at {cas_public_key_path}. "
                    "Please ensure CAS keys are provisioned."
                )
                return False
            
            # Load failsafe conditions from config
            failsafe_config = self.config.get('failsafe', {})
            failsafe_conditions = FailsafeConditions(
                max_invalid_commands=failsafe_config.get('max_invalid_commands', 5),
                communication_timeout=failsafe_config.get('communication_timeout', 120)
            )
            
            # Create drone agent from storage
            self.logger.info("Loading drone keys from secure storage...")
            self.agent = DroneAgent.from_storage(
                drone_id=self.drone_id,
                password=self.password,
                cas_public_key_path=cas_public_key_path,
                failsafe_conditions=failsafe_conditions,
                telemetry_callback=self._telemetry_callback,
                alert_callback=self._alert_callback
            )
            
            self.logger.info("Drone agent initialization complete")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize drone agent: {e}", exc_info=True)
            return False
    
    def _get_cas_public_key_path(self) -> str:
        """
        Get the path to the CAS public key.
        
        Returns:
            Path to CAS public key file
        """
        # Try to find CAS public key in standard locations
        possible_paths = [
            "data/cas/cas_public_key.pem",
            "data/cas/public_key.pem",
            f"data/cas/drones/{self.drone_id}/cas_public_key.pem"
        ]
        
        for path in possible_paths:
            if Path(path).exists():
                return path
        
        # Default path
        return "data/cas/cas_public_key.pem"
    
    def _telemetry_callback(self, telemetry_data: bytes) -> None:
        """
        Callback for sending telemetry to CAS.
        
        In production, this would transmit telemetry over the network.
        For now, we just log it.
        
        Args:
            telemetry_data: Encrypted telemetry bytes
        """
        self.logger.debug(f"Telemetry collected: {len(telemetry_data)} bytes")
        
        # In production, this would:
        # 1. Establish secure channel to CAS
        # 2. Transmit telemetry data
        # 3. Handle acknowledgment
        # 4. Retry on failure
    
    def _alert_callback(self, alert_type: str, details: Dict[str, Any]) -> None:
        """
        Callback for sending alerts to CAS.
        
        Args:
            alert_type: Type of alert (e.g., "failsafe_triggered")
            details: Alert details
        """
        self.logger.warning(f"Alert: {alert_type} - {details}")
        
        # In production, this would send alerts to CAS
    
    def start(self) -> None:
        """
        Start the drone agent.
        
        Initializes the agent, connects to CAS, and begins listening for commands.
        """
        if not self.initialize():
            self.logger.error("Drone initialization failed. Exiting.")
            sys.exit(1)
        
        self.running = True
        
        # Start the agent
        self.agent.start()
        
        cas_config = self.config.get('cas', {})
        cas_host = cas_config.get('host', 'localhost')
        cas_port = cas_config.get('port', 8443)
        
        self.logger.info(f"Drone {self.drone_id} started")
        self.logger.info(f"Configured to connect to CAS at {cas_host}:{cas_port}")
        self.logger.info("Waiting for commands... (Press Ctrl+C to stop)")
        
        # Main loop - in production, this would listen for commands from CAS
        try:
            while self.running:
                # Check failsafe conditions periodically
                self.agent.failsafe.check_conditions()
                
                # In production, this would:
                # 1. Listen for incoming commands from CAS
                # 2. Process commands via agent.receive_command()
                # 3. Send periodic telemetry
                # 4. Handle reconnection if connection lost
                
                # For now, just sleep and wait for signals
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.logger.info("Received shutdown signal")
            self.shutdown()
    
    def receive_command(self, sealed_command_data: bytes) -> Dict[str, Any]:
        """
        Receive and process a command from CAS.
        
        This is the entry point for command processing when running as a service.
        
        Args:
            sealed_command_data: Sealed command bytes from CAS
            
        Returns:
            Dictionary containing processing result
        """
        if not self.agent:
            return {
                "success": False,
                "message": "Drone agent not initialized"
            }
        
        return self.agent.receive_command(sealed_command_data)
    
    def shutdown(self) -> None:
        """
        Gracefully shutdown the drone agent.
        
        Sends final telemetry and cleans up resources.
        """
        if not self.running:
            return
        
        self.logger.info(f"Shutting down Drone {self.drone_id}...")
        self.running = False
        
        try:
            if self.agent:
                self.agent.shutdown()
            
            self.logger.info(f"Drone {self.drone_id} stopped")
            
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
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current drone status.
        
        Returns:
            Dictionary containing status information
        """
        if not self.agent:
            return {
                "drone_id": self.drone_id,
                "status": "NOT_INITIALIZED"
            }
        
        return self.agent.get_status()


def main():
    """
    Main entry point for drone agent.
    """
    # Parse command line arguments
    if len(sys.argv) < 3:
        print("Usage: python drone_main.py <drone_id> <password> [config_path]")
        print("Example: python drone_main.py DRONE_01 mypassword config/system_config.yaml")
        sys.exit(1)
    
    drone_id = sys.argv[1]
    password = sys.argv[2]
    config_path = sys.argv[3] if len(sys.argv) > 3 else "config/system_config.yaml"
    
    # Create and start drone runner
    drone = DroneRunner(drone_id, password, config_path)
    drone.start()


if __name__ == "__main__":
    main()
