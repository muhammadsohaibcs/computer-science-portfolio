# SDRCAS Examples

This directory contains example scripts demonstrating the Secure Drone Command Authorization System.

## Example Scripts

### 1. provision_system.py

Provisions the entire SDRCAS system with keys and certificates.

**What it does:**
- Generates CAS master keypair
- Provisions 3 drones (DRONE_01, DRONE_02, DRONE_03)
- Provisions 4 operators with different roles:
  - OPERATOR_ADMIN (admin role)
  - OPERATOR_PILOT_01 (pilot role)
  - OPERATOR_PILOT_02 (pilot role)
  - OPERATOR_OBSERVER (observer role)
- Registers all entities with the CAS

**Usage:**
```bash
python examples/provision_system.py
```

**Output:**
- CAS keys in `data/cas/`
- Drone credentials in `data/drones/`
- Operator credentials in `data/operators/`
- CAS registrations in `data/cas/drones/` and `data/cas/operators/`

### 2. command_flow_demo.py

Demonstrates the complete end-to-end command flow.

**What it demonstrates:**
1. Operator authentication with MFA
2. Command request creation and validation
3. Command submission to CAS
4. Authorization decision making
5. Command signing and sealing
6. Drone agent initialization
7. Command transmission and verification
8. Command execution on drone
9. Telemetry collection and transmission
10. Telemetry viewing by authorized operator

**Prerequisites:**
- System must be provisioned first (run provision_system.py)

**Usage:**
```bash
python examples/command_flow_demo.py
```

## Quick Start Guide

1. **Provision the system:**
   ```bash
   python examples/provision_system.py
   ```

2. **Run the command flow demonstration:**
   ```bash
   python examples/command_flow_demo.py
   ```

3. **Or run components separately:**

   **Start the CAS server:**
   ```bash
   python cas_main.py
   ```

   **Start a drone agent:**
   ```bash
   python drone_main.py DRONE_01 drone01_password
   ```

   **Start the operator console:**
   ```bash
   python operator_main.py
   ```
   
   Then in the console:
   ```
   connect
   login OPERATOR_PILOT_01 pilot01_password 123456
   move DRONE_01 33.6844 73.0479 100 15 5 "Patrol mission"
   check
   telemetry DRONE_01
   ```

## Default Credentials

### Drones
- DRONE_01: password `drone01_password`
- DRONE_02: password `drone02_password`
- DRONE_03: password `drone03_password`

### Operators
- OPERATOR_ADMIN: password `admin_password`
- OPERATOR_PILOT_01: password `pilot01_password`
- OPERATOR_PILOT_02: password `pilot02_password`
- OPERATOR_OBSERVER: password `observer_password`

### MFA Token
For demonstration purposes, any 6-digit number works (e.g., `123456`)

## Security Notes

⚠️ **WARNING:** These examples use hardcoded passwords and simplified authentication for demonstration purposes only. 

**In production:**
- Use strong, randomly generated passwords
- Store passwords securely (never in code)
- Use proper TOTP-based MFA
- Implement proper key management with HSMs
- Use TLS for all network communication
- Implement proper access controls and monitoring
