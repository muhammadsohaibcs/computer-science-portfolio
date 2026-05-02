/**
 * ServiceForm Component
 * Form for creating and editing hospital service records
 */

import React, { useEffect, useState } from 'react';
import { Service, ServiceFormData } from '../../types/service.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  code?: string;
  name?: string;
  basePrice?: string;
  durationMinutes?: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    code: '',
    name: '',
    description: '',
    basePrice: 0,
    durationMinutes: 30,
    department: '',
    category: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (service) {
      setFormData({
        code: service.code,
        name: service.name,
        description: service.description || '',
        basePrice: service.basePrice,
        durationMinutes: service.durationMinutes,
        department: service.department || '',
        category: service.category || '',
      });
    }
  }, [service]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = 'Service code is required';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    // Base price validation
    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
    }

    // Duration validation
    if (formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'basePrice' || name === 'durationMinutes' ? Number(value) : value,
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
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Service Code"
          name="code"
          value={formData.code}
          onChange={handleInputChange}
          error={errors.code}
          required
          placeholder="e.g., SRV001"
        />

        <Input
          label="Service Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          required
          placeholder="e.g., Blood Test"
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={handleInputChange}
        placeholder="Enter service description"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Base Price"
          name="basePrice"
          type="number"
          value={formData.basePrice.toString()}
          onChange={handleInputChange}
          error={errors.basePrice}
          required
          min="0"
          step="0.01"
          placeholder="0.00"
        />

        <Input
          label="Duration (minutes)"
          name="durationMinutes"
          type="number"
          value={formData.durationMinutes.toString()}
          onChange={handleInputChange}
          error={errors.durationMinutes}
          required
          min="1"
          placeholder="30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Department"
          name="department"
          value={formData.department || ''}
          onChange={handleInputChange}
          placeholder="e.g., Cardiology"
        />

        <Input
          label="Category"
          name="category"
          value={formData.category || ''}
          onChange={handleInputChange}
          placeholder="e.g., Diagnostic"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
