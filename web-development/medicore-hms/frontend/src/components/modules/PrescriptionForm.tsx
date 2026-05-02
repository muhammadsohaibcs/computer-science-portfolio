/**
 * PrescriptionForm Component
 * Form for creating and editing prescription records
 */

import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getDoctors } from '../../api/doctors.api';
import { getPatients } from '../../api/patients.api';
import { Prescription, PrescriptionFormData } from '../../types/prescription.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';

interface PrescriptionFormProps {
  prescription?: Prescription | null;
  onSubmit: (data: PrescriptionFormData) => Promise<void>;
  onCancel: () => void;
}

interface Medication {
  name: string;
  dose: string;
  qty: number;
  instructions: string;
}

interface FormErrors {
  patient?: string;
  doctor?: string;
  drugs?: string;
  [key: string]: string | undefined;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  prescription,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patient: '',
    doctor: '',
    drugs: [
      {
        name: '',
        dose: '',
        qty: 1,
        instructions: '',
      },
    ],
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Fetch patients and doctors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsResponse, doctorsResponse] = await Promise.all([
          getPatients({ limit: 1000 }),
          getDoctors({ limit: 1000 }),
        ]);
        setPatients(patientsResponse.data);
        setDoctors(doctorsResponse.data);
      } catch (error) {
        console.error('Error fetching patients/doctors:', error);
      } finally {
        setLoadingPatients(false);
        setLoadingDoctors(false);
      }
    };

    fetchData();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (prescription) {
      setFormData({
        patient: prescription.patient,
        doctor: prescription.doctor,
        drugs: prescription.drugs.length > 0 ? prescription.drugs : [
          {
            name: '',
            dose: '',
            qty: 1,
            instructions: '',
          },
        ],
        notes: prescription.notes || '',
      });
    }
  }, [prescription]);

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

    // Medications validation
    if (formData.drugs.length === 0) {
      newErrors.drugs = 'At least one medication is required';
    } else {
      let hasValidMedication = false;
      formData.drugs.forEach((drug, index) => {
        if (drug.name.trim()) {
          hasValidMedication = true;
          
          // Validate individual medication fields
          if (!drug.dose.trim()) {
            newErrors[`drug-${index}-dose`] = 'Dosage is required';
          }
          
          if (!drug.qty || drug.qty <= 0) {
            newErrors[`drug-${index}-qty`] = 'Quantity must be greater than 0';
          }
          
          if (!drug.instructions.trim()) {
            newErrors[`drug-${index}-instructions`] = 'Instructions are required';
          }
        }
      });

      if (!hasValidMedication) {
        newErrors.drugs = 'At least one medication with a name is required';
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

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedDrugs = [...prev.drugs];
      updatedDrugs[index] = {
        ...updatedDrugs[index],
        [field]: value,
      };
      return {
        ...prev,
        drugs: updatedDrugs,
      };
    });

    // Clear error for this medication field
    const errorKey = `drug-${index}-${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: undefined,
      }));
    }

    // Clear general drugs error if exists
    if (errors.drugs) {
      setErrors((prev) => ({
        ...prev,
        drugs: undefined,
      }));
    }
  };

  const handleAddMedication = () => {
    setFormData((prev) => ({
      ...prev,
      drugs: [
        ...prev.drugs,
        {
          name: '',
          dose: '',
          qty: 1,
          instructions: '',
        },
      ],
    }));
  };

  const handleRemoveMedication = (index: number) => {
    if (formData.drugs.length > 1) {
      setFormData((prev) => ({
        ...prev,
        drugs: prev.drugs.filter((_, i) => i !== index),
      }));

      // Clear errors for this medication
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`drug-${index}-name`];
        delete newErrors[`drug-${index}-dose`];
        delete newErrors[`drug-${index}-qty`];
        delete newErrors[`drug-${index}-instructions`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty medications before submitting
    const filteredData = {
      ...formData,
      drugs: formData.drugs.filter((drug) => drug.name.trim() !== ''),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(filteredData);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Patient and Doctor Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Prescription Information
        </h4>

        <Select
          label="Patient"
          name="patient"
          value={formData.patient}
          onChange={handleSelectChange}
          options={patients.map((p) => ({
            value: p._id,
            label: `${p.name} - ${p.contact?.email || 'No email'}`,
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
          options={doctors.map((d) => ({
            value: d._id,
            label: `${d.name} - ${d.specialization?.join(', ') || 'No specialization'}`,
          }))}
          error={errors.doctor}
          required
          disabled={loadingDoctors}
          placeholder={loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}
        />
      </div>

      {/* Medications Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">
            Medications <span className="text-red-500">*</span>
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedication}
            ariaLabel="Add medication"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Medication
          </Button>
        </div>

        {errors.drugs && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">
            {errors.drugs}
          </p>
        )}

        <div className="space-y-4">
          {formData.drugs.map((drug, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medication {index + 1}
                </h5>
                {formData.drugs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Remove medication ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Medication Name"
                    name={`drug-${index}-name`}
                    value={drug.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    error={errors[`drug-${index}-name`]}
                    required
                    placeholder="Enter medication name"
                  />
                </div>

                <Input
                  label="Dosage"
                  name={`drug-${index}-dose`}
                  value={drug.dose}
                  onChange={(e) => handleMedicationChange(index, 'dose', e.target.value)}
                  error={errors[`drug-${index}-dose`]}
                  required
                  placeholder="e.g., 500mg"
                />

                <Input
                  label="Quantity"
                  name={`drug-${index}-qty`}
                  type="number"
                  value={drug.qty.toString()}
                  onChange={(e) =>
                    handleMedicationChange(index, 'qty', parseInt(e.target.value) || 0)
                  }
                  error={errors[`drug-${index}-qty`]}
                  required
                  min="1"
                  placeholder="Enter quantity"
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Instructions"
                    name={`drug-${index}-instructions`}
                    value={drug.instructions}
                    onChange={(e) =>
                      handleMedicationChange(index, 'instructions', e.target.value)
                    }
                    error={errors[`drug-${index}-instructions`]}
                    required
                    placeholder="e.g., Take twice daily after meals"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes Section */}
      <div>
        <Textarea
          label="Additional Notes (Optional)"
          name="notes"
          value={formData.notes || ''}
          onChange={handleTextareaChange}
          placeholder="Enter any additional notes or special instructions"
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {prescription ? 'Update Prescription' : 'Create Prescription'}
        </Button>
      </div>
    </form>
  );
};

export default PrescriptionForm;
