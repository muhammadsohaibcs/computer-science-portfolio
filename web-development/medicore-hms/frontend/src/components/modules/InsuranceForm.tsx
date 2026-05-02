/**
 * InsuranceForm Component
 * Form for creating and editing insurance records
 */

import React, { useEffect, useState } from 'react';
import { getPatients } from '../../api/patients.api';
import { Insurance, InsuranceFormData } from '../../types/insurance.types';
import { Patient } from '../../types/patient.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';

interface InsuranceFormProps {
  insurance?: Insurance | null;
  onSubmit: (data: InsuranceFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  providerName?: string;
  policyNumber?: string;
  patient?: string;
  validFrom?: string;
  validTo?: string;
  [key: string]: string | undefined;
}

const InsuranceForm: React.FC<InsuranceFormProps> = ({
  insurance,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<InsuranceFormData>({
    providerName: '',
    policyNumber: '',
    patient: '',
    validFrom: '',
    validTo: '',
    details: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const response = await getPatients({ limit: 1000 });
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (insurance) {
      setFormData({
        providerName: insurance.providerName,
        policyNumber: insurance.policyNumber,
        patient: insurance.patient,
        validFrom: insurance.validFrom ? insurance.validFrom.split('T')[0] : '',
        validTo: insurance.validTo ? insurance.validTo.split('T')[0] : '',
        details: insurance.details || '',
      });
    }
  }, [insurance]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Provider name validation
    if (!formData.providerName.trim()) {
      newErrors.providerName = 'Provider name is required';
    }

    // Policy number validation
    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Policy number is required';
    }

    // Patient validation
    if (!formData.patient.trim()) {
      newErrors.patient = 'Patient ID is required';
    }

    // Date validation
    if (formData.validFrom && formData.validTo) {
      const fromDate = new Date(formData.validFrom);
      const toDate = new Date(formData.validTo);
      
      if (toDate < fromDate) {
        newErrors.validTo = 'Valid to date must be after valid from date';
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
    if (errors[name]) {
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
    if (errors[name]) {
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
      {/* Provider Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Provider Information
        </h4>

        <Input
          label="Provider Name"
          name="providerName"
          value={formData.providerName}
          onChange={handleInputChange}
          error={errors.providerName}
          required
          placeholder="Enter insurance provider name"
        />

        <Input
          label="Policy Number"
          name="policyNumber"
          value={formData.policyNumber}
          onChange={handleInputChange}
          error={errors.policyNumber}
          required
          placeholder="Enter policy number"
        />
      </div>

      {/* Patient Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Patient Information
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
      </div>

      {/* Coverage Period Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Coverage Period
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valid From"
            name="validFrom"
            type="date"
            value={formData.validFrom || ''}
            onChange={handleInputChange}
            error={errors.validFrom}
          />

          <Input
            label="Valid To"
            name="validTo"
            type="date"
            value={formData.validTo || ''}
            onChange={handleInputChange}
            error={errors.validTo}
          />
        </div>
      </div>

      {/* Additional Details Section */}
      <div>
        <Textarea
          label="Coverage Details (Optional)"
          name="details"
          value={formData.details || ''}
          onChange={handleTextareaChange}
          placeholder="Enter coverage details, limitations, or additional information"
          rows={4}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {insurance ? 'Update Insurance' : 'Create Insurance'}
        </Button>
      </div>
    </form>
  );
};

export default InsuranceForm;
