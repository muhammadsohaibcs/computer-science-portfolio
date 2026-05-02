/**
 * Tests for database views configuration module
 */

const { expect } = require('chai');
const viewsConfig = require('../src/database/views-config');

describe('Views Configuration', function() {
  describe('View Definitions', function() {
    it('should have all required views defined', function() {
      expect(viewsConfig.views).to.have.property('patients_receptionist_view');
      expect(viewsConfig.views).to.have.property('patients_nurse_view');
      expect(viewsConfig.views).to.have.property('appointments_patient_view');
      expect(viewsConfig.views).to.have.property('inventory_pharmacist_view');
      expect(viewsConfig.views).to.have.property('medical_records_summary_view');
    });

    it('each view should have source, pipeline, and description', function() {
      Object.entries(viewsConfig.views).forEach(([viewName, config]) => {
        expect(config).to.have.property('source');
        expect(config).to.have.property('pipeline');
        expect(config).to.have.property('description');
        expect(config.pipeline).to.be.an('array');
        expect(config.pipeline.length).to.be.greaterThan(0);
      });
    });
  });

  describe('getCreateCommands', function() {
    it('should return MongoDB shell commands as a string', function() {
      const commands = viewsConfig.getCreateCommands();
      expect(commands).to.be.a('string');
      expect(commands.length).to.be.greaterThan(0);
    });

    it('should include db.createView commands for all views', function() {
      const commands = viewsConfig.getCreateCommands();
      expect(commands).to.include('db.createView');
      expect(commands).to.include('patients_receptionist_view');
      expect(commands).to.include('patients_nurse_view');
      expect(commands).to.include('appointments_patient_view');
      expect(commands).to.include('inventory_pharmacist_view');
      expect(commands).to.include('medical_records_summary_view');
    });

    it('should include descriptions for each view', function() {
      const commands = viewsConfig.getCreateCommands();
      Object.values(viewsConfig.views).forEach(config => {
        expect(commands).to.include(config.description);
      });
    });
  });

  describe('getViewName', function() {
    it('should return correct view name for valid collection and role', function() {
      expect(viewsConfig.getViewName('patients', 'receptionist')).to.equal('patients_receptionist_view');
      expect(viewsConfig.getViewName('patients', 'nurse')).to.equal('patients_nurse_view');
      expect(viewsConfig.getViewName('appointments', 'patient')).to.equal('appointments_patient_view');
      expect(viewsConfig.getViewName('inventory', 'pharmacist')).to.equal('inventory_pharmacist_view');
    });

    it('should handle case-insensitive role names', function() {
      expect(viewsConfig.getViewName('patients', 'RECEPTIONIST')).to.equal('patients_receptionist_view');
      expect(viewsConfig.getViewName('patients', 'Nurse')).to.equal('patients_nurse_view');
    });

    it('should return null for non-existent view', function() {
      expect(viewsConfig.getViewName('patients', 'admin')).to.be.null;
      expect(viewsConfig.getViewName('nonexistent', 'receptionist')).to.be.null;
    });
  });

  describe('View Security', function() {
    it('receptionist view should exclude medicalRecords and emergencyContact', function() {
      const view = viewsConfig.views.patients_receptionist_view;
      const projection = view.pipeline[0].$project;
      expect(projection).to.not.have.property('medicalRecords');
      expect(projection).to.not.have.property('emergencyContact');
      expect(projection).to.have.property('name');
      expect(projection).to.have.property('contact.phone');
    });

    it('nurse view should include emergencyContact but exclude medicalRecords', function() {
      const view = viewsConfig.views.patients_nurse_view;
      const projection = view.pipeline[0].$project;
      expect(projection).to.have.property('emergencyContact');
      expect(projection).to.not.have.property('medicalRecords');
      expect(projection).to.have.property('contact');
    });

    it('pharmacist view should exclude cost-related fields', function() {
      const view = viewsConfig.views.inventory_pharmacist_view;
      const projection = view.pipeline[0].$project;
      expect(projection).to.not.have.property('costPrice');
      expect(projection).to.not.have.property('markup');
      expect(projection).to.have.property('itemCode');
      expect(projection).to.have.property('quantity');
    });
  });
});
