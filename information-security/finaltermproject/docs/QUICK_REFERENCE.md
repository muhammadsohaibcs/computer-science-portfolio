# SDRCAS Quick Reference Guide

## System Overview

**SDRCAS** = Secure Drone/Robot Command Authorization System

A Zero-Trust cryptographic command-and-control system that ensures:
- ✅ No drone accepts commands blindly
- ✅ No operator can issue unauthorized commands  
- ✅ No attacker can replay, spoof, or inject commands

## Key Components

```
Operator Console → CAS (Authorization Server) → Drone Agent
                        ↓
                   Audit Blockchain
```

## How It Works (Simple)

1. **Provisioning**: Generate cryptographic keys for everyone
2. **Authentication**: Operator logs in with MFA
3. **Request**: Operator creates command request
4. **Authorization**: CAS checks permissions and policies
5. **Sealing**: CAS signs and encrypts command
6. **Transmission**: Send encrypted command to drone
7. **Verification**: Drone verifies signature, target, freshness, nonce
8. **Execution**: Drone executes verified command
9. **Telemetry**: Drone sends encrypted status back
10. **Audit**: Everything logged to immutable blockchain

## Security Layers

1. **Identity**: Ed25519 cryptographic keys
2. **Authentication**: MFA + session tokens
3. **Authorization**: Role + policy checks
4. **Integrity**: Digital signatures
5. **Freshness**: Timestamps + nonces
6. **Audit**: Hash-chained blockchain

## Command Flow (60 seconds)

```
OPERATOR                    CAS                      DRONE
   │                         │                         │
   │──1. Login (MFA)────────▶│                         │
   │◀─2. Session Token───────│                         │
   │                         │                         │
   │──3. Command Request────▶│                         │
   │                         │──4. Check Permissions   │
   │                         │──5. Evaluate Policies   │
   │                         │──6. Sign Command        │
   │                         │──7. Encrypt Command     │
   │                         │                         │
   │                         │──8. Send Sealed Cmd────▶│
   │                         │                         │──9. Verify Signature
   │                         │                         │──10. Check Target
   │                         │                         │──11. Check Freshness
   │                         │                         │──12. Check Nonce
   │                         │                         │──13. Execute
   │                         │                         │
   │                         │◀─14. Telemetry──────────│
   │◀─15. Status Update──────│                         │
```

## Cryptographic Algorithms

- **Signatures**: Ed25519 (256-bit)
- **Encryption**: AES-256-GCM
- **Hashing**: SHA-256
- **Key Exchange**: X25519
- **Key Derivation**: HKDF-SHA256

## Command Types

- **MOVE**: Navigate to coordinates
- **LAND**: Land at current or specified location
- **STATUS**: Request status report
- **EMERGENCY_STOP**: Immediate halt

## Key Files

```
data/
├── cas/
│   ├── drones/          # Registered drones
│   ├── operators/       # Registered operators
│   └── cas_private_key.pem
├── drones/
│   └── DRONE_XX/
│       ├── private_key.pem
│       └── certificate.json
├── operators/
│   └── OPERATOR_XX/
│       ├── private_key.pem
│       └── certificate.json
└── audit_log.jsonl      # Immutable audit trail
```

## Common Operations

### Provision a Drone
```python
from provisioning.device_enrollment import enroll_drone

private_key, public_key, cert = enroll_drone(
    drone_id="DRONE_01",
    issuer_name="CAS",
    issuer_private_key=cas_key,
    capabilities=["MOVE", "LAND", "STATUS"]
)
```

### Send a Command
```python
from operator.command_builder import CommandBuilder

builder = CommandBuilder()
command = builder.create_move_command(
    drone_id="DRONE_01",
    coordinates=[33.6844, 73.0479],
    duration=300
)
```

### Verify a Command (Drone Side)
```python
from drone.verifier import verify_command_complete

verified, reason = verify_command_complete(
    token=command_token,
    signature=signature,
    drone_id="DRONE_01",
    cas_public_key=cas_pub_key
)
```

## Security Features

### Replay Protection
- Every command has unique 32-byte nonce
- Drone tracks all used nonces
- Duplicate nonce = replay attack detected

### Freshness
- Commands have `issued_at` and `expires_at` timestamps
- Drone rejects expired commands
- Typical validity: 5 minutes

### Audit Trail
- Every operation logged
- Hash-chained for tamper-evidence
- Blockchain structure for integrity
- Append-only storage

### Failsafe
- Triggers on security violations
- Rejects all commands except emergency override
- Executes safe behavior (hover, land, return home)

## Performance Targets

- Command authorization: < 100ms
- Signature verification: < 10ms
- Encryption/decryption: < 5ms
- Audit log write: < 1ms
- Nonce lookup: < 1ms

## Error Handling

All errors fail securely:
- Invalid signature → Command rejected
- Expired command → Command rejected
- Wrong target → Command rejected
- Replay detected → Command rejected
- Authorization failed → Command denied

## Testing

- **Unit Tests**: 80%+ coverage
- **Property Tests**: 100 iterations per property
- **Integration Tests**: End-to-end flows
- **Security Tests**: Penetration testing

## Deployment

### CAS
- High-availability cluster
- Hardware Security Module (HSM)
- PostgreSQL database
- Append-only audit storage

### Drone
- Embedded Linux
- TPM 2.0 for key storage
- Encrypted flash storage
- OTA firmware updates

## Quick Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Command rejected | Invalid signature | Check CAS public key |
| Replay detected | Nonce reused | Generate new command |
| Command expired | Past expiration | Increase validity duration |
| Unauthorized | Insufficient role | Grant required role |
| Failsafe active | Security violation | Emergency override |

## Configuration

### Enable Post-Quantum Crypto
```yaml
# crypto_config.yaml
post_quantum:
  enabled: true
  kem_algorithm: "Kyber-768"
```

### Adjust Rate Limits
```yaml
# system_config.yaml
rate_limiting:
  commands_per_minute: 60
  auth_attempts_per_minute: 5
```

### Configure Policies
```json
// policy_config.json
{
  "command_role_requirements": {
    "MOVE": ["pilot", "admin"],
    "EMERGENCY_STOP": ["admin"]
  }
}
```

## Support

- **Documentation**: `/docs/COMPLETE_SRS.md`
- **Architecture**: `/docs/architecture.md`
- **Examples**: `/examples/`
- **Tests**: `/tests/`

---

**Remember**: Security is not optional. Every command is verified. Every operation is logged. Trust nothing, verify everything.
