#!/usr/bin/env python3
"""
Example Command Flow Demonstration for SDRCAS
Demonstrates end-to-end command flow including authentication, authorization, and execution.

This script shows:
1. Operator authentication with CAS
2. Command request creation and submission
3. Authorization decision making
4. Command signing and sealing
5. Command verification and execution on drone
6. Telemetry collection and transmission

Requirements: All
"""

import sys
import os
from pathlib import Path

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from core.authentication import deserialize_private_key, deserialize_public_key
from operator_console.console import OperatorConsole
from operator_console.command_builder import CommandBuilder
from server.gateway import CommandGateway
from server.telemetry_handler import TelemetryHandler
from drone.agent import DroneAgent


def print_header(text: str) -> None:
    """Print a formatted header."""
    print(f"\n{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}\n")


def print_step(step_num: int, text: str) -> None:
    """Print a step header."""
    print(f"\n--- Step {step_num}: {text} ---\n")


def load_cas_keys():
    """Load CAS keys from storage."""
    print_step(1, "Loading CAS Keys")
    
    cas_dir = Path("data/cas")
    
    # Load CAS private key
    with open(cas_dir / "cas_private_key.pem", 'rb') as f:
        cas_private_pem = f.read()
    
    cas_password = b"cas_master_password_change_in_production"
    cas_private_key = deserialize_private_key(cas_private_pem, cas_password)
    
    # Load CAS public key
    with open(cas_dir / "cas_public_key.pem", 'rb') as f:
        cas_public_pem = f.read()
    
    cas_public_key = deserialize_public_key(cas_public_pem)
    
    print("✓ CAS keys loaded successfully")
    
    return cas_private_key, cas_public_key


def initialize_operator_console():
    """Initialize and authenticate operator console."""
    print_step(2, "Operator Authentication")
    
    # Create operator console
    console = OperatorConsole("localhost:8443")
    
    # Connect to CAS
    print("Connecting to CAS...")
    if not console.connect_to_cas():
        raise Exception("Failed to connect to CAS")
    print("✓ Connected to CAS")
    
    # Authenticate operator
    print("\nAuthenticating as OPERATOR_PILOT_01...")
    auth_response = console.login(
        username="OPERATOR_PILOT_01",
        password="pilot01_password",
        mfa_token="123456"
    )
    
    if not auth_response.success:
        raise Exception(f"Authentication failed: {auth_response.error_message}")
    
    print(f"✓ Authenticated successfully")
    print(f"  Operator ID: {auth_response.operator_id}")
    print(f"  Session Token: {auth_response.session_token[:20]}...")
    print(f"  Expires At: {auth_response.expires_at}")
    
    return console


def create_and_submit_command(console):
    """Create and submit a command request."""
    print_step(3, "Command Request Creation and Submission")
    
    # Create command builder
    builder = CommandBuilder()
    
    # Create a MOVE command
    print("Creating MOVE command for DRONE_01...")
    command = builder.create_move_command(
        drone_id="DRONE_01",
        coordinates=(33.6844, 73.0479),  # Islamabad coordinates
        altitude=100.0,
        speed=15.0,
        duration=10,
        justification="Patrol mission - sector alpha"
    )
    
    print("✓ Command created:")
    print(f"  Type: {command['command_type']}")
    print(f"  Target: {command['target_drone_id']}")
    print(f"  Coordinates: {command['parameters']['coordinates']}")
    print(f"  Altitude: {command['parameters']['altitude']}m")
    print(f"  Speed: {command['parameters']['speed']}m/s")
    print(f"  Validity: {command['validity_duration']}s")
    
    # Submit command
    print("\nSubmitting command to CAS...")
    result = console.submit_command(command)
    
    if not result.success:
        raise Exception(f"Command submission failed: {result.error_message}")
    
    print(f"✓ Command submitted successfully")
    print(f"  Request ID: {result.request_id}")
    
    return result.request_id


def check_command_status(console, request_id):
    """Check the status of a submitted command."""
    print_step(4, "Authorization and Command Status")
    
    print(f"Checking status of request {request_id}...")
    status = console.get_command_status(request_id)
    
    if not status:
        raise Exception("Command request not found")
    
    print("✓ Command status retrieved:")
    print(f"  Status: {status['status']}")
    print(f"  Operator: {status['operator_id']}")
    print(f"  Command Type: {status['command_type']}")
    print(f"  Target Drone: {status['target_drone_id']}")
    
    if 'rejection_reason' in status:
        print(f"  Rejection Reason: {status['rejection_reason']}")
    
    if status.get('sealed_command_available'):
        print("  ✓ Sealed command is available for transmission")
    
    return status


def initialize_drone_agent(cas_public_key):
    """Initialize a drone agent."""
    print_step(5, "Drone Agent Initialization")
    
    print("Initializing DRONE_01 agent...")
    
    # Create drone agent from storage
    agent = DroneAgent.from_storage(
        drone_id="DRONE_01",
        password="drone01_password",
        cas_public_key_path="data/cas/cas_public_key.pem",
        capabilities=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"]
    )
    
    # Start the agent
    agent.start()
    
    print("✓ Drone agent initialized and started")
    print(f"  Drone ID: {agent.drone_id}")
    print(f"  Status: {agent.status}")
    print(f"  Capabilities: {', '.join(agent.executor.capabilities)}")
    
    return agent


def transmit_and_execute_command(console, request_id, agent):
    """Transmit sealed command to drone and execute."""
    print_step(6, "Command Transmission and Execution")
    
    # Get the sealed command from the gateway
    print("Retrieving sealed command from CAS...")
    sealed_command = console._gateway.get_sealed_command(request_id)
    
    if not sealed_command:
        raise Exception("Sealed command not available")
    
    print("✓ Sealed command retrieved")
    print(f"  Encrypted data size: {len(sealed_command.encrypted_token)} bytes")
    print(f"  Signature size: {len(sealed_command.signature)} bytes")
    
    # Transmit to drone (serialize sealed command)
    print("\nTransmitting command to drone...")
    sealed_command_bytes = sealed_command.to_bytes()
    
    # Drone receives and processes command
    print("Drone receiving and verifying command...")
    result = agent.receive_command(sealed_command_bytes)
    
    if result['success']:
        print("✓ Command executed successfully")
        print(f"  Command Type: {result['command_type']}")
        print(f"  Message: {result['message']}")
        
        if result['execution_result']:
            exec_result = result['execution_result']
            print(f"  Execution Details:")
            for key, value in exec_result.details.items():
                print(f"    - {key}: {value}")
    else:
        print(f"✗ Command execution failed: {result['message']}")
    
    return result


def collect_and_view_telemetry(console, agent):
    """Collect telemetry from drone and view it."""
    print_step(7, "Telemetry Collection and Viewing")
    
    print("Drone collecting telemetry...")
    telemetry_bytes = agent.send_telemetry()
    
    if telemetry_bytes:
        print(f"✓ Telemetry collected and encrypted ({len(telemetry_bytes)} bytes)")
    
    # Authorize operator to view telemetry
    console.authorize_telemetry_access("DRONE_01")
    
    # View telemetry through console
    print("\nOperator viewing telemetry...")
    telemetry_list = console.view_telemetry("DRONE_01", limit=1)
    
    if telemetry_list:
        telemetry = telemetry_list[0]
        print("✓ Telemetry retrieved:")
        print(f"  Drone ID: {telemetry['drone_id']}")
        print(f"  Timestamp: {telemetry['timestamp']}")
        print(f"  Position: {telemetry['position']}")
        print(f"  Battery: {telemetry['battery']}%")
        print(f"  Status: {telemetry['status']}")
        print(f"  Last Command: {telemetry['last_command']}")
        if telemetry['errors']:
            print(f"  Errors: {telemetry['errors']}")
    else:
        print("No telemetry available")


def print_summary():
    """Print a summary of the demonstration."""
    print_header("Command Flow Demonstration Complete")
    
    print("✓ Successfully demonstrated:")
    print("  1. CAS key loading and initialization")
    print("  2. Operator authentication with MFA")
    print("  3. Command request creation and validation")
    print("  4. Command submission to CAS")
    print("  5. Authorization decision making")
    print("  6. Command signing and sealing")
    print("  7. Drone agent initialization")
    print("  8. Command transmission to drone")
    print("  9. Command verification (signature, target, freshness, nonce)")
    print(" 10. Command execution on drone")
    print(" 11. Telemetry collection and encryption")
    print(" 12. Telemetry viewing by authorized operator")
    
    print("\nKey Security Features Demonstrated:")
    print("  • Cryptographic authentication (operator and drone)")
    print("  • Role-based authorization")
    print("  • Digital signatures for command integrity")
    print("  • Encryption for command confidentiality")
    print("  • Replay protection with nonces")
    print("  • Time-bound command validity")
    print("  • Secure telemetry transmission")
    print("  • Audit logging of all operations")
    print()


def main():
    """
    Main demonstration workflow.
    """
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║   SDRCAS End-to-End Command Flow Demonstration                   ║
║   Secure Drone Command Authorization System                      ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    print("This demonstration shows the complete command flow from operator")
    print("authentication through command execution and telemetry collection.")
    print("\nPrerequisites:")
    print("  • System must be provisioned (run examples/provision_system.py)")
    print("  • CAS keys must exist in data/cas/")
    print("  • Drone and operator credentials must be provisioned")
    
    input("\nPress Enter to begin the demonstration...")
    
    try:
        # Step 1: Load CAS keys
        cas_private_key, cas_public_key = load_cas_keys()
        
        # Step 2: Initialize and authenticate operator
        console = initialize_operator_console()
        
        # Step 3: Create and submit command
        request_id = create_and_submit_command(console)
        
        # Step 4: Check command status
        status = check_command_status(console, request_id)
        
        # Step 5: Initialize drone agent
        agent = initialize_drone_agent(cas_public_key)
        
        # Step 6: Transmit and execute command
        result = transmit_and_execute_command(console, request_id, agent)
        
        # Step 7: Collect and view telemetry
        collect_and_view_telemetry(console, agent)
        
        # Print summary
        print_summary()
        
        # Cleanup
        print("Cleaning up...")
        agent.shutdown()
        console.logout()
        console.disconnect_from_cas()
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Demonstration failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
