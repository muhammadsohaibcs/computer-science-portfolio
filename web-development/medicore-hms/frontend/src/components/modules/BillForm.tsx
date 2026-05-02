/**
 * BillForm Component
 * Form for creating and editing billing records
 */

import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getPatients } from '../../api/patients.api';
import { Bill, BillFormData, BillItem } from '../../types/bill.types';
import { Patient } from '../../types/patient.types';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import Input from '../common/Input';
import Select from '../common/Select';

interface BillFormProps {
  bill?: Bill | null;
  onSubmit: (data: BillFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  patient?: string;
  items?: string;
  [key: string]: string | undefined;
}

const BillForm: React.FC<BillFormProps> = ({ bill, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BillFormData>({
    patient: '',
    items: [
      {
        service: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ],
    subtotal: 0,
    taxes: 0,
    total: 0,
    paid: false,
    payments: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(0.1); // 10% default tax rate
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const response = await getPatients({ limit: 1000 }); // Get all patients
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  // Initialize form data when bill prop changes
  useEffect(() => {
    if (bill) {
      setFormData({
        patient: bill.patient || '',
        items:
          bill.items.length > 0
            ? bill.items
            : [
                {
                  service: '',
                  description: '',
                  quantity: 1,
                  unitPrice: 0,
                  totalPrice: 0,
                },
              ],
        subtotal: bill.subtotal,
        taxes: bill.taxes,
        total: bill.total,
        paid: bill.paid,
        payments: bill.payments || [],
      });
    }
  }, [bill]);

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;

    setFormData((prev) => ({
      ...prev,
      subtotal: Math.round(subtotal * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      total: Math.round(total * 100) / 100,
    }));
  }, [formData.items, taxRate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Patient validation
    if (!formData.patient.trim()) {
      newErrors.patient = 'Patient ID is required';
    }

    // Items validation
    if (formData.items.length === 0) {
      newErrors.items = 'At least one service item is required';
    } else {
      let hasValidItem = false;
      formData.items.forEach((item, index) => {
        if (item.description?.trim() || item.service?.trim()) {
          hasValidItem = true;

          // Validate individual item fields
          if (!item.description?.trim() && !item.service?.trim()) {
            newErrors[`item-${index}-description`] = 'Description or service ID is required';
          }

          if (!item.quantity || item.quantity <= 0) {
            newErrors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
          }

          if (item.unitPrice < 0) {
            newErrors[`item-${index}-unitPrice`] = 'Unit price cannot be negative';
          }
        }
      });

      if (!hasValidItem) {
        newErrors.items = 'At least one service item with description is required';
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTaxRate(Math.max(0, Math.min(1, value))); // Clamp between 0 and 1
  };

  const handleItemChange = (
    index: number,
    field: keyof BillItem,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index] };

      // Update the field based on type
      if (field === 'quantity' || field === 'unitPrice' || field === 'totalPrice') {
        item[field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
      } else if (field === 'service' || field === 'description') {
        item[field] = value as string;
      }

      // Recalculate total price for this item
      item.totalPrice = Math.round(item.quantity * item.unitPrice * 100) / 100;

      updatedItems[index] = item;

      return {
        ...prev,
        items: updatedItems,
      };
    });

    // Clear error for this item field
    const errorKey = `item-${index}-${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: undefined,
      }));
    }

    // Clear general items error if exists
    if (errors.items) {
      setErrors((prev) => ({
        ...prev,
        items: undefined,
      }));
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          service: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));

      // Clear errors for this item
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`item-${index}-service`];
        delete newErrors[`item-${index}-description`];
        delete newErrors[`item-${index}-quantity`];
        delete newErrors[`item-${index}-unitPrice`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty items and clean service field before submitting
    const filteredData = {
      ...formData,
      items: formData.items
        .filter((item) => item.description?.trim() || item.service?.trim())
        .map((item) => ({
          ...item,
          // Set service to undefined if it's empty or not a valid format
          service: item.service?.trim() ? item.service : undefined,
        })),
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
      {/* Patient Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Bill Information
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

      {/* Service Items Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">
            Service Items <span className="text-red-500">*</span>
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            ariaLabel="Add service item"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>

        {errors.items && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">
            {errors.items}
          </p>
        )}

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item {index + 1}
                </h5>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Service ID (Optional)"
                  name={`item-${index}-service`}
                  value={item.service || ''}
                  onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                  error={errors[`item-${index}-service`]}
                  placeholder="Enter service ID"
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Description"
                    name={`item-${index}-description`}
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    error={errors[`item-${index}-description`]}
                    required
                    placeholder="Enter service description"
                  />
                </div>

                <Input
                  label="Quantity"
                  name={`item-${index}-quantity`}
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(e) =>
                    handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                  }
                  error={errors[`item-${index}-quantity`]}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter quantity"
                />

                <Input
                  label="Unit Price ($)"
                  name={`item-${index}-unitPrice`}
                  type="number"
                  value={item.unitPrice.toString()}
                  onChange={(e) =>
                    handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                  }
                  error={errors[`item-${index}-unitPrice`]}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter unit price"
                />

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Item Total:
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Rate Section */}
      <div>
        <Input
          label="Tax Rate (0-1)"
          name="taxRate"
          type="number"
          value={taxRate.toString()}
          onChange={handleTaxRateChange}
          min="0"
          max="1"
          step="0.01"
          placeholder="Enter tax rate (e.g., 0.1 for 10%)"
        />
      </div>

      {/* Totals Summary Section */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Bill Summary
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="text-md font-medium text-gray-900 dark:text-white">
              ${formData.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Taxes ({(taxRate * 100).toFixed(0)}%):
            </span>
            <span className="text-md font-medium text-gray-900 dark:text-white">
              ${formData.taxes.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-300 dark:border-blue-700">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ${formData.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Status Section */}
      <div>
        <Checkbox
          label="Mark as Paid"
          name="paid"
          checked={formData.paid}
          onChange={handleCheckboxChange}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {bill ? 'Update Bill' : 'Create Bill'}
        </Button>
      </div>
    </form>
  );
};

export default BillForm;
