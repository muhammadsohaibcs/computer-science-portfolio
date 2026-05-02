#!/usr/bin/env python3
"""
Operator Console Main Entry Point
Initializes and runs the operator console with CLI interface.
Provides command submission and telemetry viewing capabilities.

Requirements: All
"""

import sys
import cmd
import logging
import yaml
from pathlib import Path
from typing import Optional, Dict, Any

from operator_console.console import OperatorConsole
from operator_console.command_builder import CommandBuilder


class OperatorCLI(cmd.Cmd):
    """
    Command-line interface for the operator console.
    
    Provides an interactive shell for operators to:
    - Connect to CAS
    - Authenticate
    - Submit commands
    - View command status
    - Monitor telemetry
    """
    
    intro = """
╔═══════════════════════════════════════════════════════════╗
║   Secure Drone Command Authorization System (SDRCAS)     ║
║              Operator Console v1.0                        ║
╚═══════════════════════════════════════════════════════════╝

Type 'help' or '?' to list available commands.
Type 'help <command>' for detailed help on a specific command.
    """
    
    prompt = "SDRCAS> "
    
    def __init__(self, config_path: str = "config/system_config.yaml"):
        """
        Initialize the operator CLI.
        
        Args:
            config_path: Path to system configuration file
        """
        super().__init__()
        self.config = self._load_config(config_path)
        self.logger = self._setup_logging()
        
        # Initialize console
        cas_config = self.config.get('cas', {})
        cas_address = f"{cas_config.get('host', 'localhost')}:{cas_config.get('port', 8443)}"
        self.console = OperatorConsole(cas_address)
        self.command_builder = CommandBuilder()
        
        # Track last command request ID
        self.last_request_id: Optional[str] = None
    
    def _load_config(self, config_path: str) -> dict:
        """Load system configuration."""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception:
            return {'cas': {'host': 'localhost', 'port': 8443}}
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        log_config = self.config.get('logging', {})
        log_level = getattr(logging, log_config.get('level', 'INFO'))
        
        logger = logging.getLogger('OperatorConsole')
        logger.setLevel(log_level)
        
        if log_config.get('console_logging', True):
            handler = logging.StreamHandler()
            handler.setLevel(log_level)
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    # Command implementations
    
    def do_connect(self, arg):
        """
        Connect to the Command Authorization Server.
        Usage: connect [cas_address]
        Example: connect localhost:8443
        """
        cas_address = arg.strip() if arg.strip() else None
        
        if self.console.connect_to_cas(cas_address):
            print("✓ Connected to CAS successfully")
            self.logger.info("Connected to CAS")
        else:
            print("✗ Failed to connect to CAS")
            self.logger.error("Failed to connect to CAS")
    
    def do_login(self, arg):
        """
        Authenticate with the CAS.
        Usage: login <username> <password> <mfa_token>
        Example: login OPERATOR_PILOT_01 mypassword 123456
        """
        args = arg.split()
        if len(args) != 3:
            print("Usage: login <username> <password> <mfa_token>")
            return
        
        username, password, mfa_token = args
        
        if not self.console.is_connected():
            print("✗ Not connected to CAS. Use 'connect' first.")
            return
        
        print(f"Authenticating as {username}...")
        response = self.console.login(username, password, mfa_token)
        
        if response.success:
            print(f"✓ Authentication successful")
            print(f"  Operator ID: {response.operator_id}")
            print(f"  Session expires at: {response.expires_at}")
            self.prompt = f"SDRCAS [{username}]> "
            self.logger.info(f"Logged in as {username}")
        else:
            print(f"✗ Authentication failed: {response.error_message}")
            self.logger.error(f"Login failed: {response.error_message}")
    
    def do_logout(self, arg):
        """
        Logout from the CAS.
        Usage: logout
        """
        if self.console.logout():
            print("✓ Logged out successfully")
            self.prompt = "SDRCAS> "
            self.logger.info("Logged out")
        else:
            print("✗ No active session to logout")
    
    def do_status(self, arg):
        """
        Show current connection and session status.
        Usage: status
        """
        print("\n=== System Status ===")
        print(f"Connected to CAS: {'Yes' if self.console.is_connected() else 'No'}")
        print(f"Authenticated: {'Yes' if self.console.is_authenticated() else 'No'}")
        
        session_info = self.console.get_session_info()
        if session_info:
            print(f"\n=== Session Information ===")
            print(f"Operator ID: {session_info['operator_id']}")
            print(f"Session expires at: {session_info['expires_at']}")
            print(f"Time remaining: {session_info['time_remaining']} seconds")
            print(f"Session valid: {'Yes' if session_info['is_valid'] else 'No'}")
        
        print()
    
    def do_move(self, arg):
        """
        Submit a MOVE command to a drone.
        Usage: move <drone_id> <lat> <lon> <altitude> <speed> [duration] [justification]
        Example: move DRONE_01 33.6844 73.0479 100 15 5 "Patrol mission"
        """
        args = arg.split(maxsplit=6)
        if len(args) < 5:
            print("Usage: move <drone_id> <lat> <lon> <altitude> <speed> [duration] [justification]")
            return
        
        try:
            drone_id = args[0]
            lat = float(args[1])
            lon = float(args[2])
            altitude = float(args[3])
            speed = float(args[4])
            duration = int(args[5]) if len(args) > 5 else None
            justification = args[6] if len(args) > 6 else None
            
            command = self.command_builder.create_move_command(
                drone_id=drone_id,
                coordinates=(lat, lon),
                altitude=altitude,
                speed=speed,
                duration=duration,
                justification=justification
            )
            
            self._submit_command(command)
            
        except ValueError as e:
            print(f"✗ Invalid parameter: {e}")
    
    def do_land(self, arg):
        """
        Submit a LAND command to a drone.
        Usage: land <drone_id> [duration] [justification]
        Example: land DRONE_01 5 "Mission complete"
        """
        args = arg.split(maxsplit=2)
        if len(args) < 1:
            print("Usage: land <drone_id> [duration] [justification]")
            return
        
        try:
            drone_id = args[0]
            duration = int(args[1]) if len(args) > 1 and args[1].isdigit() else None
            justification = args[2] if len(args) > 2 else None
            
            command = self.command_builder.create_land_command(
                drone_id=drone_id,
                duration=duration,
                justification=justification
            )
            
            self._submit_command(command)
            
        except ValueError as e:
            print(f"✗ Invalid parameter: {e}")
    
    def do_getstatus(self, arg):
        """
        Submit a STATUS command to a drone.
        Usage: getstatus <drone_id> [duration] [justification]
        Example: getstatus DRONE_01 5 "Health check"
        """
        args = arg.split(maxsplit=2)
        if len(args) < 1:
            print("Usage: getstatus <drone_id> [duration] [justification]")
            return
        
        try:
            drone_id = args[0]
            duration = int(args[1]) if len(args) > 1 and args[1].isdigit() else None
            justification = args[2] if len(args) > 2 else None
            
            command = self.command_builder.create_status_command(
                drone_id=drone_id,
                duration=duration,
                justification=justification
            )
            
            self._submit_command(command)
            
        except ValueError as e:
            print(f"✗ Invalid parameter: {e}")
    
    def do_emergency(self, arg):
        """
        Submit an EMERGENCY_STOP command to a drone.
        Usage: emergency <drone_id> <reason> [duration] [justification]
        Example: emergency DRONE_01 "Security threat detected" 5 "Immediate halt required"
        """
        args = arg.split(maxsplit=3)
        if len(args) < 2:
            print("Usage: emergency <drone_id> <reason> [duration] [justification]")
            return
        
        try:
            drone_id = args[0]
            reason = args[1]
            duration = int(args[2]) if len(args) > 2 and args[2].isdigit() else None
            justification = args[3] if len(args) > 3 else None
            
            command = self.command_builder.create_emergency_stop_command(
                drone_id=drone_id,
                reason=reason,
                duration=duration,
                justification=justification
            )
            
            self._submit_command(command)
            
        except ValueError as e:
            print(f"✗ Invalid parameter: {e}")
    
    def _submit_command(self, command: Dict[str, Any]) -> None:
        """
        Submit a command to the CAS.
        
        Args:
            command: Command request dictionary
        """
        if not self.console.is_authenticated():
            print("✗ Not authenticated. Use 'login' first.")
            return
        
        print(f"Submitting {command['command_type']} command to {command['target_drone_id']}...")
        result = self.console.submit_command(command)
        
        if result.success:
            print(f"✓ Command submitted successfully")
            print(f"  Request ID: {result.request_id}")
            self.last_request_id = result.request_id
            self.logger.info(f"Command submitted: {result.request_id}")
        else:
            print(f"✗ Command submission failed: {result.error_message}")
            self.logger.error(f"Command submission failed: {result.error_message}")
    
    def do_check(self, arg):
        """
        Check the status of a command request.
        Usage: check [request_id]
        If no request_id provided, checks the last submitted command.
        Example: check abc123-def456
        """
        request_id = arg.strip() if arg.strip() else self.last_request_id
        
        if not request_id:
            print("✗ No request ID provided and no previous command to check")
            return
        
        status = self.console.get_command_status(request_id)
        
        if status:
            print(f"\n=== Command Status ===")
            print(f"Request ID: {status['request_id']}")
            print(f"Operator: {status['operator_id']}")
            print(f"Command Type: {status['command_type']}")
            print(f"Target Drone: {status['target_drone_id']}")
            print(f"Status: {status['status']}")
            print(f"Created At: {status['created_at']}")
            
            if 'rejection_reason' in status:
                print(f"Rejection Reason: {status['rejection_reason']}")
            
            if status.get('sealed_command_available'):
                print("Sealed Command: Available")
            
            print()
        else:
            print(f"✗ Command request not found: {request_id}")
    
    def do_telemetry(self, arg):
        """
        View telemetry data for a drone.
        Usage: telemetry <drone_id> [limit]
        Example: telemetry DRONE_01 5
        """
        args = arg.split()
        if len(args) < 1:
            print("Usage: telemetry <drone_id> [limit]")
            return
        
        drone_id = args[0]
        limit = int(args[1]) if len(args) > 1 else 10
        
        if not self.console.is_authenticated():
            print("✗ Not authenticated. Use 'login' first.")
            return
        
        try:
            # Authorize telemetry access (for demo purposes)
            self.console.authorize_telemetry_access(drone_id)
            
            telemetry_list = self.console.view_telemetry(drone_id, limit)
            
            if not telemetry_list:
                print(f"No telemetry data available for {drone_id}")
                return
            
            print(f"\n=== Telemetry for {drone_id} ===")
            for i, telemetry in enumerate(telemetry_list, 1):
                print(f"\n--- Entry {i} ---")
                print(f"Timestamp: {telemetry['timestamp']}")
                print(f"Position: {telemetry['position']}")
                print(f"Battery: {telemetry['battery']}%")
                print(f"Status: {telemetry['status']}")
                print(f"Last Command: {telemetry['last_command']}")
                if telemetry['errors']:
                    print(f"Errors: {telemetry['errors']}")
            
            print()
            
        except PermissionError as e:
            print(f"✗ Permission denied: {e}")
        except Exception as e:
            print(f"✗ Error retrieving telemetry: {e}")
    
    def do_exit(self, arg):
        """
        Exit the operator console.
        Usage: exit
        """
        if self.console.is_authenticated():
            print("Logging out...")
            self.console.logout()
        
        if self.console.is_connected():
            print("Disconnecting from CAS...")
            self.console.disconnect_from_cas()
        
        print("Goodbye!")
        return True
    
    def do_quit(self, arg):
        """Alias for exit."""
        return self.do_exit(arg)
    
    def do_EOF(self, arg):
        """Handle Ctrl+D."""
        print()
        return self.do_exit(arg)
    
    def emptyline(self):
        """Do nothing on empty line."""
        pass


def main():
    """
    Main entry point for operator console.
    """
    # Parse command line arguments
    config_path = "config/system_config.yaml"
    if len(sys.argv) > 1:
        config_path = sys.argv[1]
    
    # Create and run CLI
    try:
        cli = OperatorCLI(config_path)
        cli.cmdloop()
    except KeyboardInterrupt:
        print("\n\nInterrupted. Exiting...")
        sys.exit(0)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
