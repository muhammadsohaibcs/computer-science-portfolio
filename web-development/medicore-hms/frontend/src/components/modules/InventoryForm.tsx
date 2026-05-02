/**
 * InventoryForm Component
 * Form for creating and editing inventory items
 */

import React, { useEffect, useState } from 'react';
import { InventoryFormData, InventoryItem } from '../../types/inventory.types';
import Button from '../common/Button';
import Input from '../common/Input';

interface InventoryFormProps {
  item?: InventoryItem | null;
  onSubmit: (data: InventoryFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  itemCode?: string;
  name?: string;
  quantity?: string;
  unit?: string;
  reorderThreshold?: string;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    itemCode: '',
    name: '',
    category: '',
    quantity: 0,
    unit: 'pcs',
    reorderThreshold: 10,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (item) {
      setFormData({
        itemCode: item.itemCode,
        name: item.name,
        category: item.category || '',
        quantity: item.quantity,
        unit: item.unit,
        reorderThreshold: item.reorderThreshold,
      });
    }
  }, [item]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Item code validation
    if (!formData.itemCode.trim()) {
      newErrors.itemCode = 'Item code is required';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    // Quantity validation
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    // Unit validation
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    // Reorder threshold validation
    if (formData.reorderThreshold < 0) {
      newErrors.reorderThreshold = 'Reorder threshold cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
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
      // Remove supplier field from submission
      const { supplier, ...dataToSubmit } = formData;
      await onSubmit(dataToSubmit);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Item Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Item Information
        </h4>

        <Input
          label="Item Code"
          name="itemCode"
          value={formData.itemCode}
          onChange={handleInputChange}
          error={errors.itemCode}
          required
          placeholder="Enter unique item code"
          disabled={!!item} // Disable editing item code for existing items
        />

        <Input
          label="Item Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          required
          placeholder="Enter item name"
        />

        <Input
          label="Category (Optional)"
          name="category"
          value={formData.category || ''}
          onChange={handleInputChange}
          placeholder="e.g., Medication, Equipment, Supplies"
        />
      </div>

      {/* Stock Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Stock Information
        </h4>

        <Input
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity.toString()}
          onChange={handleInputChange}
          error={errors.quantity}
          required
          placeholder="Enter current quantity"
          min="0"
        />

        <Input
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleInputChange}
          error={errors.unit}
          required
          placeholder="e.g., pcs, boxes, bottles"
        />

        <Input
          label="Minimum Stock Level"
          name="reorderThreshold"
          type="number"
          value={formData.reorderThreshold.toString()}
          onChange={handleInputChange}
          error={errors.reorderThreshold}
          required
          placeholder="Enter minimum stock level for reorder alerts"
          min="0"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
