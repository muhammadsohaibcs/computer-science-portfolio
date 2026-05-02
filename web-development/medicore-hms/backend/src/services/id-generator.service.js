const Counter = require('../models/counter.model');
const logger = require('../utils/logger');

/**
 * ID Generator Service
 * Generates unique IDs with prefix-based format (e.g., DOC001, PAT001, APT001)
 * Thread-safe using MongoDB's findOneAndUpdate with atomic operations
 */

class IdGeneratorService {
  /**
   * Generate next ID for a given prefix
   * @param {string} prefix - The prefix for the ID (e.g., 'DOC', 'PAT', 'APT')
   * @param {string} description - Optional description of what this counter is for
   * @returns {Promise<string>} - The generated ID (e.g., 'DOC001')
   */
  async generateId(prefix, description = '') {
    try {
      // Use findOneAndUpdate with upsert for atomic operation
      // This ensures thread-safety even with concurrent requests
      const counter = await Counter.findOneAndUpdate(
        { prefix: prefix.toUpperCase() },
        { 
          $inc: { sequence: 1 },
          $setOnInsert: { description }
        },
        { 
          new: true, // Return updated document
          upsert: true, // Create if doesn't exist
          runValidators: true
        }
      );

      // Format the ID with 3-digit padding (e.g., 001, 002, 999)
      const formattedId = `${prefix.toUpperCase()}${String(counter.sequence).padStart(3, '0')}`;
      
      logger.info(`Generated ID: ${formattedId}`);
      return formattedId;
    } catch (error) {
      logger.error(`Error generating ID for prefix ${prefix}:`, error);
      throw new Error(`Failed to generate ID: ${error.message}`);
    }
  }

  /**
   * Generate Doctor ID
   * @returns {Promise<string>} - Doctor ID (e.g., 'DOC001')
   */
  async generateDoctorId() {
    return this.generateId('DOC', 'Doctor ID');
  }

  /**
   * Generate Patient ID
   * @returns {Promise<string>} - Patient ID (e.g., 'PAT001')
   */
  async generatePatientId() {
    return this.generateId('PAT', 'Patient ID');
  }

  /**
   * Generate Staff ID
   * @returns {Promise<string>} - Staff ID (e.g., 'STF001')
   */
  async generateStaffId() {
    return this.generateId('STF', 'Staff ID');
  }

  /**
   * Generate Appointment ID
   * @returns {Promise<string>} - Appointment ID (e.g., 'APT001')
   */
  async generateAppointmentId() {
    return this.generateId('APT', 'Appointment ID');
  }

  /**
   * Generate Lab Order ID
   * @returns {Promise<string>} - Lab Order ID (e.g., 'LAB001')
   */
  async generateLabOrderId() {
    return this.generateId('LAB', 'Lab Order ID');
  }

  /**
   * Generate Prescription ID
   * @returns {Promise<string>} - Prescription ID (e.g., 'PRX001')
   */
  async generatePrescriptionId() {
    return this.generateId('PRX', 'Prescription ID');
  }

  /**
   * Generate Room ID
   * @returns {Promise<string>} - Room ID (e.g., 'ROM001')
   */
  async generateRoomId() {
    return this.generateId('ROM', 'Room ID');
  }

  /**
   * Generate Bill ID
   * @returns {Promise<string>} - Bill ID (e.g., 'BIL001')
   */
  async generateBillId() {
    return this.generateId('BIL', 'Bill ID');
  }

  /**
   * Generate Department ID
   * @returns {Promise<string>} - Department ID (e.g., 'DEP001')
   */
  async generateDepartmentId() {
    return this.generateId('DEP', 'Department ID');
  }

  /**
   * Generate Medicine ID
   * @returns {Promise<string>} - Medicine ID (e.g., 'MED001')
   */
  async generateMedicineId() {
    return this.generateId('MED', 'Medicine ID');
  }

  /**
   * Generate Lab Test ID
   * @returns {Promise<string>} - Lab Test ID (e.g., 'TST001')
   */
  async generateLabTestId() {
    return this.generateId('TST', 'Lab Test ID');
  }

  /**
   * Generate Admission ID
   * @returns {Promise<string>} - Admission ID (e.g., 'ADM001')
   */
  async generateAdmissionId() {
    return this.generateId('ADM', 'Admission ID');
  }

  /**
   * Generate Admin ID
   * @returns {Promise<string>} - Admin ID (e.g., 'ADM001')
   */
  async generateAdminId() {
    return this.generateId('ADMIN', 'Admin ID');
  }

  /**
   * Get current sequence value for a prefix (without incrementing)
   * @param {string} prefix - The prefix to check
   * @returns {Promise<number>} - Current sequence value
   */
  async getCurrentSequence(prefix) {
    try {
      const counter = await Counter.findOne({ prefix: prefix.toUpperCase() });
      return counter ? counter.sequence : 0;
    } catch (error) {
      logger.error(`Error getting current sequence for prefix ${prefix}:`, error);
      throw new Error(`Failed to get current sequence: ${error.message}`);
    }
  }

  /**
   * Reset counter for a prefix (use with caution!)
   * @param {string} prefix - The prefix to reset
   * @returns {Promise<void>}
   */
  async resetCounter(prefix) {
    try {
      await Counter.findOneAndUpdate(
        { prefix: prefix.toUpperCase() },
        { sequence: 0 },
        { upsert: true }
      );
      logger.warn(`Counter reset for prefix: ${prefix}`);
    } catch (error) {
      logger.error(`Error resetting counter for prefix ${prefix}:`, error);
      throw new Error(`Failed to reset counter: ${error.message}`);
    }
  }
}

module.exports = new IdGeneratorService();
