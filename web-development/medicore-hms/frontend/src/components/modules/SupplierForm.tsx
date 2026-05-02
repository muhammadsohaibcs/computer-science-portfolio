/**
 * Supplier Form Component
 * Form for creating and editing suppliers
 */

import { useState } from 'react';
import { ApiError } from '../../types/api.types';
import { Supplier, SupplierFormData } from '../../types/supplier.types';
import Button from '../common/Button';
import Input from '../common/Input';

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Supplier Form Component
 */
export default function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
}: SupplierFormProps): JSX.Element {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: supplier?.name || '',
    contact: {
      email: supplier?.contact?.email || '',
      phone: supplier?.contact?.phone || '',
      address: supplier?.contact?.address || '',
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validates the form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    // Validate email format if provided
    if (formData.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate phone format if provided
    if (formData.contact.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.contact.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      const apiError = err as ApiError;
      setSubmitError(apiError.message || 'Failed to save supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles input changes
   */
  const handleChange = (field: keyof SupplierFormData | string, value: string) => {
    if (field.startsWith('contact.')) {
      const contactField = field.split('.')[1] as keyof typeof formData.contact;
      setFormData({
        ...formData,
        contact: {
          ...formData.contact,
          [contactField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submit Error */}
      {submitError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Supplier Information
        </h3>

        <Input
          name="name"
          label="Supplier Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Enter supplier name"
        />
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contact Information
        </h3>

        <Input
          name="email"
          label="Email"
          type="email"
          value={formData.contact.email || ''}
          onChange={(e) => handleChange('contact.email', e.target.value)}
          error={errors.email}
          placeholder="supplier@example.com"
        />

        <Input
          name="phone"
          label="Phone"
          type="tel"
          value={formData.contact.phone || ''}
          onChange={(e) => handleChange('contact.phone', e.target.value)}
          error={errors.phone}
          placeholder="+1 (555) 123-4567"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address
          </label>
          <textarea
            value={formData.contact.address || ''}
            onChange={(e) => handleChange('contact.address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter supplier address"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
          ariaLabel="Cancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          ariaLabel={supplier ? 'Update supplier' : 'Create supplier'}
        >
          {supplier ? 'Update' : 'Create'} Supplier
        </Button>
      </div>
    </form>
  );
}
