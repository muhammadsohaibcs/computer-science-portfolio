/**
 * RoomForm Component
 * Form for creating and editing rooms
 */

import React, { useEffect, useState } from 'react';
import { Room, RoomFormData, RoomStatus, RoomType } from '../../types/room.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface RoomFormProps {
  room?: Room | null;
  onSubmit: (data: RoomFormData) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  roomNumber?: string;
  type?: string;
  status?: string;
  floor?: string;
  capacity?: string;
}

const ROOM_TYPES: RoomType[] = ['General', 'Private', 'ICU', 'Operation'];
const ROOM_STATUSES: RoomStatus[] = ['Available', 'Occupied', 'Maintenance'];

const RoomForm: React.FC<RoomFormProps> = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<RoomFormData>({
    roomNumber: '',
    type: 'General',
    status: 'Available',
    floor: undefined,
    capacity: 1,
    assignedPatient: '',
    features: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        type: room.type,
        status: room.status,
        floor: room.floor,
        capacity: room.capacity || 1,
        assignedPatient: room.assignedPatient || '',
        features: room.features || [],
      });
      setFeaturesInput((room.features || []).join(', '));
    }
  }, [room]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Room number validation
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Room type is required';
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Room status is required';
    }

    // Floor validation
    if (formData.floor !== undefined && formData.floor < 0) {
      newErrors.floor = 'Floor cannot be negative';
    }

    // Capacity validation
    if (formData.capacity !== undefined && formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value, 10) : undefined) : value,
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

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFeaturesInput(value);
    
    // Parse comma-separated features
    const featuresArray = value
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    
    setFormData((prev) => ({
      ...prev,
      features: featuresArray,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up data before submission
      const submitData: RoomFormData = {
        ...formData,
        assignedPatient: formData.assignedPatient?.trim() || undefined,
      };
      
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Room Information Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Room Information
        </h4>

        <Input
          label="Room Number"
          name="roomNumber"
          value={formData.roomNumber}
          onChange={handleInputChange}
          error={errors.roomNumber}
          required
          placeholder="Enter room number (e.g., 101, A-205)"
          disabled={!!room} // Disable editing room number for existing rooms
        />

        <Select
          label="Room Type"
          name="type"
          value={formData.type}
          onChange={handleSelectChange}
          error={errors.type}
          required
          options={ROOM_TYPES.map(type => ({ value: type, label: type }))}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleSelectChange}
          error={errors.status}
          required
          options={ROOM_STATUSES.map(status => ({ value: status, label: status }))}
        />

        <Input
          label="Floor (Optional)"
          name="floor"
          type="number"
          value={formData.floor?.toString() || ''}
          onChange={handleInputChange}
          error={errors.floor}
          placeholder="Enter floor number"
          min="0"
        />

        <Input
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity?.toString() || '1'}
          onChange={handleInputChange}
          error={errors.capacity}
          required
          placeholder="Enter room capacity"
          min="1"
        />
      </div>

      {/* Patient Assignment Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Patient Assignment
        </h4>

        <Input
          label="Assigned Patient ID (Optional)"
          name="assignedPatient"
          value={formData.assignedPatient || ''}
          onChange={handleInputChange}
          placeholder="Enter patient ID if room is occupied"
          disabled={formData.status !== 'Occupied'}
        />

        {formData.status !== 'Occupied' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Patient assignment is only available when room status is "Occupied"
          </p>
        )}
      </div>

      {/* Features Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Room Features
        </h4>

        <Input
          label="Features (Optional)"
          name="features"
          value={featuresInput}
          onChange={handleFeaturesChange}
          placeholder="Enter features separated by commas (e.g., Ventilator, Monitor, Private Bathroom)"
        />
        
        {formData.features && formData.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {room ? 'Update Room' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
};

export default RoomForm;
