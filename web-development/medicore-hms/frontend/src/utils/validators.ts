/**
 * Form Validation Utilities
 * Provides validation functions for form inputs and medical data
 */

/**
 * Validates an email address
 * @param email - Email address to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a phone number (supports various formats)
 * @param phone - Phone number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it has 10-15 digits (supports international formats)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Validates that a field is not empty
 * @param value - Value to validate
 * @returns True if not empty, false otherwise
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
}

/**
 * Validates a date is in the past
 * @param date - Date to validate
 * @returns True if date is in the past, false otherwise
 */
export function isDateInPast(date: string | Date): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj.getTime() < Date.now();
}

/**
 * Validates a date is in the future
 * @param date - Date to validate
 * @returns True if date is in the future, false otherwise
 */
export function isDateInFuture(date: string | Date): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj.getTime() > Date.now();
}

/**
 * Validates a date of birth (must be in past and person must be under 150 years old)
 * @param dob - Date of birth to validate
 * @returns True if valid, false otherwise
 */
export function isValidDateOfBirth(dob: string | Date): boolean {
  if (!dob) return false;
  
  const dateObj = typeof dob === 'string' ? new Date(dob) : dob;
  
  if (isNaN(dateObj.getTime())) return false;
  
  const now = new Date();
  const age = now.getFullYear() - dateObj.getFullYear();
  
  // Must be in the past and less than 150 years old
  return dateObj.getTime() < now.getTime() && age >= 0 && age <= 150;
}

/**
 * Validates a numeric value is within a range
 * @param value - Value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if within range, false otherwise
 */
export function isInRange(value: number, min: number, max: number): boolean {
  if (isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Validates a string length is within a range
 * @param value - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if within range, false otherwise
 */
export function isLengthInRange(value: string, min: number, max: number): boolean {
  if (!value) return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validates a medical record number format (alphanumeric, 6-20 characters)
 * @param mrn - Medical record number to validate
 * @returns True if valid, false otherwise
 */
export function isValidMedicalRecordNumber(mrn: string): boolean {
  if (!mrn) return false;
  
  const mrnRegex = /^[A-Z0-9]{6,20}$/i;
  return mrnRegex.test(mrn.trim());
}

/**
 * Validates a prescription dosage format (e.g., "500mg", "10ml", "2 tablets")
 * @param dosage - Dosage to validate
 * @returns True if valid, false otherwise
 */
export function isValidDosage(dosage: string): boolean {
  if (!dosage) return false;
  
  const dosageRegex = /^\d+(\.\d+)?\s*(mg|g|ml|l|tablet|tablets|capsule|capsules|unit|units)$/i;
  return dosageRegex.test(dosage.trim());
}

/**
 * Validates a blood pressure reading format (e.g., "120/80")
 * @param bp - Blood pressure reading to validate
 * @returns True if valid, false otherwise
 */
export function isValidBloodPressure(bp: string): boolean {
  if (!bp) return false;
  
  const bpRegex = /^\d{2,3}\/\d{2,3}$/;
  if (!bpRegex.test(bp.trim())) return false;
  
  const [systolic, diastolic] = bp.split('/').map(Number);
  
  // Validate reasonable ranges
  return systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150;
}

/**
 * Validates a temperature reading (in Celsius or Fahrenheit)
 * @param temp - Temperature value
 * @param unit - Unit of measurement ('C' or 'F')
 * @returns True if valid, false otherwise
 */
export function isValidTemperature(temp: number, unit: 'C' | 'F' = 'C'): boolean {
  if (isNaN(temp)) return false;
  
  if (unit === 'C') {
    // Valid range for body temperature in Celsius: 35-42
    return temp >= 35 && temp <= 42;
  } else {
    // Valid range for body temperature in Fahrenheit: 95-108
    return temp >= 95 && temp <= 108;
  }
}

/**
 * Validates a weight value (in kg or lbs)
 * @param weight - Weight value
 * @param unit - Unit of measurement ('kg' or 'lbs')
 * @returns True if valid, false otherwise
 */
export function isValidWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): boolean {
  if (isNaN(weight) || weight <= 0) return false;
  
  if (unit === 'kg') {
    // Valid range: 0.5kg (newborn) to 500kg
    return weight >= 0.5 && weight <= 500;
  } else {
    // Valid range: 1lb to 1100lbs
    return weight >= 1 && weight <= 1100;
  }
}

/**
 * Validates a height value (in cm or inches)
 * @param height - Height value
 * @param unit - Unit of measurement ('cm' or 'in')
 * @returns True if valid, false otherwise
 */
export function isValidHeight(height: number, unit: 'cm' | 'in' = 'cm'): boolean {
  if (isNaN(height) || height <= 0) return false;
  
  if (unit === 'cm') {
    // Valid range: 30cm (newborn) to 250cm
    return height >= 30 && height <= 250;
  } else {
    // Valid range: 12in to 100in
    return height >= 12 && height <= 100;
  }
}

/**
 * Validates a postal/zip code
 * @param code - Postal code to validate
 * @param country - Country code ('US', 'CA', etc.)
 * @returns True if valid, false otherwise
 */
export function isValidPostalCode(code: string, country: string = 'US'): boolean {
  if (!code) return false;
  
  const trimmedCode = code.trim();
  
  switch (country.toUpperCase()) {
    case 'US':
      // US ZIP code: 5 digits or 5+4 format
      return /^\d{5}(-\d{4})?$/.test(trimmedCode);
    case 'CA':
      // Canadian postal code: A1A 1A1 format
      return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(trimmedCode);
    default:
      // Generic: 3-10 alphanumeric characters
      return /^[A-Z0-9]{3,10}$/i.test(trimmedCode);
  }
}

/**
 * Gets validation error message for a field
 * @param field - Field name
 * @param rule - Validation rule that failed
 * @returns Error message
 */
export function getValidationMessage(field: string, rule: string): string {
  const messages: Record<string, string> = {
    required: `${field} is required`,
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    dateInPast: `${field} must be in the past`,
    dateInFuture: `${field} must be in the future`,
    dateOfBirth: 'Please enter a valid date of birth',
    medicalRecordNumber: 'Medical record number must be 6-20 alphanumeric characters',
    dosage: 'Please enter a valid dosage (e.g., 500mg, 2 tablets)',
    bloodPressure: 'Please enter a valid blood pressure reading (e.g., 120/80)',
    temperature: 'Please enter a valid temperature',
    weight: 'Please enter a valid weight',
    height: 'Please enter a valid height',
    postalCode: 'Please enter a valid postal code',
  };
  
  return messages[rule] || `${field} is invalid`;
}
