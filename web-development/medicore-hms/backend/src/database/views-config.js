/**
 * Role-based database views for security and data abstraction
 * 
 * This module defines MongoDB views that filter and project data based on user roles.
 * Views provide an additional security layer by restricting access to sensitive fields.
 * 
 * Requirements: 4.1, 4.3, 4.5
 */

module.exports = {
  enabled: process.env.ENABLE_DB_VIEWS === 'true',
  
  views: {
    // Patient view for receptionists (limited fields)
    patients_receptionist_view: {
      source: 'patients',
      pipeline: [
        {
          $project: {
            name: 1,
            dob: 1,
            gender: 1,
            'contact.phone': 1,
            'contact.email': 1,
            'contact.address': 1,
            primaryDoctor: 1,
            createdAt: 1,
            updatedAt: 1,
            // Exclude: medicalRecords, emergencyContact
          }
        }
      ],
      description: 'Receptionist view excludes medical records and emergency contacts'
    },
    
    // Patient view for nurses (includes emergency contact)
    patients_nurse_view: {
      source: 'patients',
      pipeline: [
        {
          $project: {
            name: 1,
            dob: 1,
            gender: 1,
            contact: 1,
            emergencyContact: 1,
            primaryDoctor: 1,
            createdAt: 1,
            updatedAt: 1,
            // Exclude: full medicalRecords array
          }
        }
      ],
      description: 'Nurse view includes emergency contacts but not full medical history'
    },
    
    // Appointment view for patients (own appointments only)
    appointments_patient_view: {
      source: 'appointments',
      pipeline: [
        {
          $project: {
            patient: 1,
            doctor: 1,
            appointmentDate: 1,
            status: 1,
            reason: 1,
            createdAt: 1,
            // Exclude: internal notes, billing info
          }
        }
      ],
      description: 'Patient view shows only essential appointment information'
    },
    
    // Inventory view for pharmacists (exclude cost details)
    inventory_pharmacist_view: {
      source: 'inventory',
      pipeline: [
        {
          $project: {
            itemCode: 1,
            name: 1,
            category: 1,
            quantity: 1,
            unit: 1,
            expiryDate: 1,
            supplier: 1,
            // Exclude: costPrice, markup, profit margins
          }
        }
      ],
      description: 'Pharmacist view excludes cost and pricing details'
    },
    
    // Medical records summary view (for dashboards)
    medical_records_summary_view: {
      source: 'medicalrecords',
      pipeline: [
        {
          $project: {
            patient: 1,
            doctor: 1,
            visitDate: 1,
            diagnosis: 1,
            createdAt: 1,
            // Exclude: detailed prescriptions, test results, notes
          }
        }
      ],
      description: 'Summary view for dashboards and reports'
    }
  },
  
  /**
   * Get MongoDB commands to create all views
   * @returns {string} MongoDB shell commands to create all views
   */
  getCreateCommands() {
    const commands = [];
    
    Object.entries(this.views).forEach(([viewName, config]) => {
      commands.push(`// ${config.description}`);
      commands.push(`db.createView(`);
      commands.push(`  "${viewName}",`);
      commands.push(`  "${config.source}",`);
      commands.push(`  ${JSON.stringify(config.pipeline, null, 2)}`);
      commands.push(`);`);
      commands.push('');
    });
    
    return commands.join('\n');
  },
  
  /**
   * Get view name for role and collection
   * @param {string} collection - The base collection name (e.g., 'patients', 'appointments')
   * @param {string} role - The user role (e.g., 'receptionist', 'nurse', 'patient')
   * @returns {string|null} The view name if it exists, null otherwise
   */
  getViewName(collection, role) {
    const viewKey = `${collection}_${role.toLowerCase()}_view`;
    return this.views[viewKey] ? viewKey : null;
  }
};
