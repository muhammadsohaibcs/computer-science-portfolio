/**
 * MedicalRecordForm Component
 * Form for creating and editing medical record entries
 */

import React, { useEffect, useState } from 'react';
import { getDoctors } from '../../api/doctors.api';
import { getPatients } from '../../api/patients.api';
import { Doctor } from '../../types/doctor.types';
import { MedicalRecord, MedicalRecordFormData } from '../../types/medical-record.types';
import { Patient } from '../../types/patient.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';

interface MedicalRecordFormProps {
  medicalRecord?: MedicalRecord | null;
  onSubmit: (data: MedicalRecordFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  patient?: string;
  doctor?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  visitDate?: string;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  medicalRecord,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    patient: '',
    doctor: '',
    diagnosis: '',
    treatment: '',
    observations: '',
    visitDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Fetch patients and doctors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPatients(true);
        setLoadingDoctors(true);
        const [patientsResponse, doctorsResponse] = await Promise.all([
          getPatients({ limit: 1000 }),
          getDoctors({ limit: 1000 }),
        ]);
        setPatients(patientsResponse.data);
        setDoctors(doctorsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingPatients(false);
        setLoadingDoctors(false);
      }
    };

    fetchData();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (medicalRecord) {
      setFormData({
        patient: medicalRecord.patient || '',
        doctor: medicalRecord.doctor || '',
        diagnosis: medicalRecord.diagnosis || '',
        treatment: medicalRecord.treatment || '',
        observations: medicalRecord.observations || '',
        visitDate: medicalRecord.visitDate ? medicalRecord.visitDate.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [medicalRecord]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Patient validation
    if (!formData.patient.trim()) {
      newErrors.patient = 'Patient ID is required';
    }

    // Doctor validation
    if (!formData.doctor.trim()) {
      newErrors.doctor = 'Doctor ID is required';
    }

    // Diagnosis validation
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    // Treatment validation
    if (!formData.treatment.trim()) {
      newErrors.treatment = 'Treatment is required';
    }

    // Observations validation
    if (!formData.observations.trim()) {
      newErrors.observations = 'Observations are required';
    }

    // Visit date validation
    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    } else {
      const visitDate = new Date(formData.visitDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (visitDate > today) {
        newErrors.visitDate = 'Visit date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Basic Information
        </h4>

        <Select
          label="Patient"
          name="patient"
          value={formData.patient}
          onChange={handleSelectChange}
          options={patients.map((patient) => ({
            value: patient._id,
            label: `${patient.name} (DOB: ${new Date(patient.dob).toLocaleDateString()})`,
          }))}
          error={errors.patient}
          required
          disabled={loadingPatients}
          placeholder={loadingPatients ? 'Loading patients...' : 'Select a patient'}
        />

        <Select
          label="Doctor"
          name="doctor"
          value={formData.doctor}
          onChange={handleSelectChange}
          options={doctors.map((doctor) => ({
            value: doctor._id,
            label: `Dr. ${doctor.name} - ${doctor.specialization}`,
          }))}
          error={errors.doctor}
          required
          disabled={loadingDoctors}
          placeholder={loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}
        />

        <Input
          label="Visit Date"
          name="visitDate"
          type="date"
          value={formData.visitDate}
          onChange={handleInputChange}
          error={errors.visitDate}
          required
        />
      </div>

      {/* Clinical Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Clinical Information
        </h4>

        <Textarea
          label="Diagnosis"
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleTextareaChange}
          error={errors.diagnosis}
          required
          placeholder="Enter diagnosis details"
          rows={3}
        />

        <Textarea
          label="Treatment"
          name="treatment"
          value={formData.treatment}
          onChange={handleTextareaChange}
          error={errors.treatment}
          required
          placeholder="Enter treatment plan"
          rows={3}
        />

        <Textarea
          label="Observations"
          name="observations"
          value={formData.observations}
          onChange={handleTextareaChange}
          error={errors.observations}
          required
          placeholder="Enter clinical observations"
          rows={4}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {medicalRecord ? 'Update Record' : 'Create Record'}
        </Button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;
