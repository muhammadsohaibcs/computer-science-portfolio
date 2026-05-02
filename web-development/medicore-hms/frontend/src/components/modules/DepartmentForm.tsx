/**
 * Department Form Component
 * Form for creating and editing departments
 */

import { useEffect, useState } from 'react';
import { getStaff } from '../../api/staff.api';
import { ApiError } from '../../types/api.types';
import { Department, DepartmentFormData } from '../../types/department.types';
import { Staff } from '../../types/staff.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface DepartmentFormProps {
  department?: Department | null;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  code?: string;
}

/**
 * Department Form Component
 */
export default function DepartmentForm({
  department,
  onSubmit,
  onCancel,
}: DepartmentFormProps): JSX.Element {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: department?.name || '',
    code: department?.code || '',
    head: department?.head || '',
    description: department?.description || '',
  });

  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Fetches staff members for head selection
   */
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        const response = await getStaff({ limit: 100 });
        setStaffMembers(response.data || []);
      } catch (err) {
        console.error('Failed to load staff:', err);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, []);

  /**
   * Validates the form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
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
      setSubmitError(apiError.message || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles input changes
   */
  const handleChange = (field: keyof DepartmentFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

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
          Department Information
        </h3>

        <Input
          name="name"
          label="Department Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="e.g., Cardiology, Radiology"
        />

        <Input
          name="code"
          label="Department Code"
          type="text"
          value={formData.code || ''}
          onChange={(e) => handleChange('code', e.target.value)}
          error={errors.code}
          placeholder="e.g., CARD, RAD"
        />

        <Select
          name="head"
          label="Department Head"
          value={formData.head || ''}
          onChange={(e) => handleChange('head', e.target.value)}
          disabled={loadingStaff}
          placeholder="Select department head (optional)"
          options={staffMembers.map((staff) => ({
            value: staff._id,
            label: `${staff.name} - ${staff.roleTitle || 'Staff'}`,
          }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter department description"
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
          ariaLabel={department ? 'Update department' : 'Create department'}
        >
          {department ? 'Update' : 'Create'} Department
        </Button>
      </div>
    </form>
  );
}
