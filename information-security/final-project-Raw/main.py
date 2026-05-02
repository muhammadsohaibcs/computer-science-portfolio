"""
Main Demo Program
=================

Runs an end-to-end demo of the Secure IoT
Device Communication System.

This file plays the same role as the SMS
project's main/demo file.
"""

from src.iot.iot_device import IoTDevice
from iot_server import IoTServer


def main():
    print("\n=== SECURE IOT DEVICE COMMUNICATION DEMO ===\n")

    device = IoTDevice("device001", "secret123", "temperature")
    server = IoTServer()

    print("\n--- STEP 1: Secure Handshake ---")
    handshake = device.initiate_secure_session()
    response = server.handle_handshake(handshake)
    device.complete_secure_session(response)

    print("\n--- STEP 2: Send Secure Sensor Data ---")
    encrypted_data = device.prepare_secure_payload()
    result = server.handle_secure_message(device.session_id, encrypted_data)

    print("\n--- RESULT ---")
    print(result)

    print("\n--- STEP 3: Blockchain Verification ---")
    print("Blockchain valid:", server.verify_blockchain())

    device.terminate_session()
    print("\n=== DEMO COMPLETE ===\n")


if __name__ == "__main__":
    main()
