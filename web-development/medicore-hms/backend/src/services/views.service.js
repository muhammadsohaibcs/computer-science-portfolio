/**
 * views.service.js
 * 
 * Service for querying MongoDB views
 * Provides easy access to pre-aggregated data
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

class ViewsService {
  /**
   * Get active appointments with patient and doctor details
   */
  async getActiveAppointments(filter = {}) {
    try {
      const collection = mongoose.connection.db.collection('activeAppointments');
      return await collection.find(filter).toArray();
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to fetch active appointments view');
      throw error;
    }
  }

  /**
   * Get low stock inventory items
   */
  async getLowStockInventory() {
    try {
      const collection = mongoose.connection.db.collection('lowStockInventory');
      return await collection.find().toArray();
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to fetch low stock inventory view');
      throw error;
    }
  }

  /**
   * Get unpaid bills with patient information
   */
  async getUnpaidBills(daysOverdue = null) {
    try {
      const collection = mongoose.connection.db.collection('unpaidBills');
      const filter = daysOverdue ? { daysOverdue: { $gte: daysOverdue } } : {};
      return await collection.find(filter).toArray();
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to fetch unpaid bills view');
      throw error;
    }
  }

  /**
   * Get recent medical records (last 90 days)
   */
  async getRecentMedicalRecords(patientId = null) {
    try {
      const collection = mongoose.connection.db.collection('recentMedicalRecords');
      const filter = patientId ? { 'patientInfo._id': mongoose.Types.ObjectId(patientId) } : {};
      return await collection.find(filter).toArray();
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to fetch recent medical records view');
      throw error;
    }
  }

  /**
   * Get active insurance policies
   */
  async getActiveInsurance(expiringInDays = null) {
    try {
      const collection = mongoose.connection.db.collection('activeInsurance');
      const filter = expiringInDays ? { daysUntilExpiry: { $lte: expiringInDays } } : {};
      return await collection.find(filter).toArray();
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to fetch active insurance view');
      throw error;
    }
  }

  /**
   * Get doctor schedules
   */
  async getDoctorSchedule(doctorId = null, date = null) {
    try {
      const collection = mongoose.connection.db.collection('doctorSchedule');
      const filter = {};
      
      if (doctorId) {
        filter['_id.doctor'] = mongoose.Types.ObjectId(doctorId);
      }
      
      if (date) {
        filter['_id.date'] = date;
      }
      
      return await collection.find(filter).toArray();
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to fetch doctor schedule view');
      throw error;
    }
  }

  /**
   * Get patient summary with statistics
   */
  async getPatientSummary(patientId = null) {
    try {
      const collection = mongoose.connection.db.collection('patientSummary');
      const filter = patientId ? { _id: mongoose.Types.ObjectId(patientId) } : {};
      return await collection.find(filter).toArray();
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to fetch patient summary view');
      throw error;
    }
  }

  /**
   * Get all available views
   */
  async listViews() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const views = collections
        .filter(c => c.type === 'view')
        .map(c => ({
          name: c.name,
          source: c.options.viewOn,
          type: 'view'
        }));
      
      return views;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to list views');
      throw error;
    }
  }
}

module.exports = new ViewsService();
