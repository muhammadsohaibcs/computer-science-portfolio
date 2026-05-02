# SDRCAS Project Structure

## 📁 Directory Layout

```
SDRCAS/
│
├── 📄 README.md                    # Main project documentation
├── 📄 RUN_PROJECT.md               # Quick start guide (5 min)
├── 📄 GETTING_STARTED.md           # Detailed setup guide
├── 📄 VERIFICATION_SUMMARY.md      # Test results
├── 📄 CLEANUP_SUMMARY.md           # Cleanup documentation
├── 📄 requirements.txt             # Python dependencies
├── 📄 .gitignore                   # Git ignore rules
│
├── 🚀 cas_main.py                  # CAS entry point
├── 🚀 drone_main.py                # Drone entry point
├── 🚀 operator_main.py             # Operator entry point
│
├── 📁 core/                        # Core Cryptographic Primitives
│   ├── __init__.py
│   ├── authentication.py           # Ed25519 signatures
│   ├── aead.py                     # AES-256-GCM encryption
│   ├── hashing.py                  # SHA-256 hashing
│   ├── key_exchange.py             # X25519 key exchange
│   ├── command_token.py            # Command token structure
│   ├── time_utils.py               # Timestamp handling
│   ├── crypto_math.py              # Cryptographic utilities
│   ├── constants.py                # System constants
│   ├── exceptions.py               # Custom exceptions
│   ├── postquantum.py              # Post-quantum crypto (optional)
│   └── POSTQUANTUM_README.md       # PQC documentation
│
├── 📁 server/                      # Command Authorization Server
│   ├── __init__.py
│   ├── gateway.py                  # Main CAS gateway
│   ├── identity.py                 # Identity management
│   ├── authorization.py            # Policy-based authorization
│   ├── command_signer.py           # Command signing & sealing
│   ├── key_manager.py              # Key management
│   ├── replay_protection.py        # Nonce store (replay prevention)
│   ├── audit.py                    # Audit logging
│   └── telemetry_handler.py        # Telemetry processing
│
├── 📁 drone/                       # Drone Agent
│   ├── __init__.py
│   ├── agent.py                    # Main drone controller
│   ├── verifier.py                 # Command verification
│   ├── executor.py                 # Command execution
│   ├── failsafe.py                 # Failsafe mechanisms
│   ├── secure_storage.py           # Secure key storage
│   └── telemetry.py                # Telemetry collection
│
├── 📁 operator_console/            # Operator Console
│   ├── __init__.py
│   ├── auth_client.py              # Authentication client
│   ├── command_builder.py          # Command builder
│   ├── session.py                  # Session management
│   └── console.py                  # Main console interface
│
├── 📁 provisioning/                # Provisioning System
│   ├── __init__.py
│   ├── device_enrollment.py        # Drone enrollment
│   ├── operator_enrollment.py      # Operator enrollment
│   └── cert_issuer.py              # Certificate issuance
│
├── 📁 ledger/                      # Audit Ledger
│   ├── __init__.py
│   ├── blockchain.py               # Blockchain structure
│   └── verifier.py                 # Chain verification
│
├── 📁 comms/                       # Communication Layer
│   ├── __init__.py
│   ├── secure_channel.py           # Encrypted channels
│   ├── packet.py                   # Packet serialization
│   └── rate_limit.py               # Rate limiting
│
├── 📁 config/                      # Configuration Files
│   ├── __init__.py
│   ├── crypto_config.yaml          # Cryptographic settings
│   ├── policy_config.json          # Authorization policies
│   └── system_config.yaml          # System configuration
│
├── 📁 data/                        # Runtime Data
│   ├── cas/                        # CAS data
│   │   ├── drones/                 # Registered drones
│   │   ├── operators/              # Registered operators
│   │   └── revoked_keys.json       # Revoked keys
│   ├── drones/                     # Drone credentials
│   │   └── DRONE_XX/
│   │       ├── private_key.pem     # Encrypted private key
│   │       └── certificate.json    # Drone certificate
│   ├── operators/                  # Operator credentials
│   │   └── OPERATOR_XX/
│   │       ├── private_key.pem     # Encrypted private key
│   │       └── certificate.json    # Operator certificate
│   └── audit_log.jsonl             # Immutable audit trail
│
├── 📁 docs/                        # Documentation
│   ├── COMPLETE_SRS.md             # Full specification (1000+ lines)
│   ├── QUICK_REFERENCE.md          # Quick reference guide
│   ├── architecture.md             # System architecture
│   ├── attack_scenarios.md         # Security analysis
│   ├── deployment.md               # Deployment guide
│   └── protocol_flow.md            # Protocol documentation
│
├── 📁 examples/                    # Example Scripts
│   ├── README.md                   # Examples documentation
│   ├── provision_system.py         # System provisioning
│   ├── command_flow_demo.py        # Command flow demo
│   ├── provisioning_example.py     # Provisioning example
│   └── secure_storage_example.py   # Storage example
│
├── 📁 tests/                       # Test Suite
│   ├── __init__.py
│   ├── test_final_verification.py  # Final verification (11 tests)
│   ├── test_crypto.py              # Cryptographic tests
│   ├── test_authorization.py       # Authorization tests
│   ├── test_audit_blockchain.py    # Audit/blockchain tests
│   ├── test_agent.py               # Drone agent tests
│   ├── test_gateway.py             # CAS gateway tests
│   └── ... (25+ test files)
│
└── 📁 .kiro/                       # Kiro Spec Files
    └── specs/
        └── drone-command-authorization/
            ├── requirements.md     # System requirements
            ├── design.md           # System design
            └── tasks.md            # Implementation tasks
```

## 🎯 Key Files to Know

### Entry Points
- **`cas_main.py`** - Start the Command Authorization Server
- **`drone_main.py`** - Start a drone agent
- **`operator_main.py`** - Start the operator console

### Configuration
- **`config/crypto_config.yaml`** - Cryptographic algorithms
- **`config/policy_config.json`** - Authorization policies
- **`config/system_config.yaml`** - System settings

### Documentation
- **`README.md`** - Project overview
- **`RUN_PROJECT.md`** - Quick start (5 minutes)
- **`GETTING_STARTED.md`** - Detailed guide
- **`docs/COMPLETE_SRS.md`** - Full specification

### Examples
- **`examples/provision_system.py`** - Set up the system
- **`examples/command_flow_demo.py`** - See it in action

### Tests
- **`tests/test_final_verification.py`** - Comprehensive verification
- **`tests/`** - 25+ test files covering all components

## 📊 Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                         Application Layer                    │
├─────────────────────────────────────────────────────────────┤
│  cas_main.py    │  drone_main.py    │  operator_main.py    │
└────────┬────────┴────────┬──────────┴────────┬──────────────┘
         │                 │                   │
         ▼                 ▼                   ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐
│     server/     │  │   drone/    │  │ operator_console/ │
│  - gateway      │  │  - agent    │  │  - console      │
│  - authorization│  │  - verifier │  │  - auth_client  │
│  - audit        │  │  - executor │  │  - cmd_builder  │
└────────┬────────┘  └──────┬──────┘  └────────┬────────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │         provisioning/                 │
         │  - device_enrollment                  │
         │  - operator_enrollment                │
         │  - cert_issuer                        │
         └──────────────┬───────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   ledger/   │  │   comms/    │  │    core/    │
│ - blockchain│  │ - secure_ch │  │ - auth      │
│ - verifier  │  │ - packet    │  │ - aead      │
└─────────────┘  └─────────────┘  │ - hashing   │
                                   │ - token     │
                                   └─────────────┘
```

## 🔄 Data Flow

```
1. Provisioning (Setup)
   examples/provision_system.py
   └─▶ provisioning/ modules
       └─▶ core/ (crypto primitives)
           └─▶ data/ (stores keys & certs)

2. Runtime (Operation)
   operator_main.py
   └─▶ operator_console/ modules
       └─▶ comms/ (secure channel)
           └─▶ cas_main.py
               └─▶ server/ modules
                   └─▶ comms/ (secure channel)
                       └─▶ drone_main.py
                           └─▶ drone/ modules
                               └─▶ ledger/ (audit)

3. Testing
   pytest tests/
   └─▶ All modules
       └─▶ Verification & validation
```

## 📦 File Sizes (Approximate)

```
Core modules:        ~50 KB
Server modules:      ~80 KB
Drone modules:       ~40 KB
Operator modules:    ~30 KB
Provisioning:        ~25 KB
Tests:              ~150 KB
Documentation:      ~500 KB
Configuration:       ~10 KB
Examples:            ~20 KB
```

## 🎨 Code Organization

### By Responsibility

- **`core/`** - Pure cryptographic functions (no business logic)
- **`server/`** - CAS business logic (authorization, audit)
- **`drone/`** - Drone business logic (verification, execution)
- **`operator_console/`** - Operator business logic (authentication, commands)
- **`provisioning/`** - Setup and enrollment logic
- **`ledger/`** - Audit and blockchain logic
- **`comms/`** - Communication abstractions

### By Security Layer

1. **Identity** - `provisioning/`, `server/identity.py`
2. **Authentication** - `operator_console/auth_client.py`, `operator_console/session.py`
3. **Authorization** - `server/authorization.py`
4. **Integrity** - `core/authentication.py`, `server/command_signer.py`
5. **Freshness** - `core/time_utils.py`, `server/replay_protection.py`
6. **Audit** - `server/audit.py`, `ledger/blockchain.py`

## 🧪 Test Coverage

```
tests/
├── Unit Tests (45%)           # Individual functions
├── Property Tests (30%)       # Universal properties
├── Integration Tests (20%)    # Component interactions
└── Security Tests (5%)        # Attack scenarios
```

## 📝 Documentation Hierarchy

```
1. Quick Start
   └─▶ RUN_PROJECT.md (5 min)

2. Setup Guide
   └─▶ GETTING_STARTED.md (30 min)

3. Reference
   └─▶ docs/QUICK_REFERENCE.md (10 min)

4. Deep Dive
   └─▶ docs/COMPLETE_SRS.md (2-3 hours)

5. Specialized
   ├─▶ docs/architecture.md
   ├─▶ docs/attack_scenarios.md
   └─▶ docs/deployment.md
```

---

**Navigate with confidence! 🗺️**
