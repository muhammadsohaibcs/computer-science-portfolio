/**
 * Role Permission Utilities
 * Provides functions for role-based access control and permission checking
 */

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  NURSE = 'Nurse',
  PATIENT = 'Patient',
  RECEPTIONIST = 'Receptionist',
  LAB_TECHNICIAN = 'Lab Technician',
  PHARMACIST = 'Pharmacist',
}

/**
 * Module/route names in the system
 */
export enum Module {
  DASHBOARD = 'dashboard',
  PATIENTS = 'patients',
  DOCTORS = 'doctors',
  STAFF = 'staff',
  DEPARTMENTS = 'departments',
  ROOMS = 'rooms',
  APPOINTMENTS = 'appointments',
  PRESCRIPTIONS = 'prescriptions',
  LAB_RESULTS = 'lab-results',
  BILLING = 'billing',
  INVENTORY = 'inventory',
  SUPPLIERS = 'suppliers',
  INSURANCE = 'insurance',
  MEDICAL_RECORDS = 'medical-records',
  SERVICES = 'services',
}

/**
 * Permission matrix defining which roles can access which modules
 * Based on Requirements 2.2, 2.3, 2.4, 2.5
 */
const PERMISSION_MATRIX: Record<Module, UserRole[]> = {
  [Module.DASHBOARD]: [
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.PATIENT,
    UserRole.RECEPTIONIST,
    UserRole.LAB_TECHNICIAN,
    UserRole.PHARMACIST,
  ],
  [Module.PATIENTS]: [
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  ],
  [Module.DOCTORS]: [UserRole.ADMIN],
  [Module.STAFF]: [UserRole.ADMIN],
  [Module.DEPARTMENTS]: [UserRole.ADMIN],
  [Module.ROOMS]: [UserRole.ADMIN, UserRole.NURSE],
  [Module.APPOINTMENTS]: [
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  ],
  [Module.PRESCRIPTIONS]: [
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.PHARMACIST,
    UserRole.PATIENT,
  ],
  [Module.LAB_RESULTS]: [
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.LAB_TECHNICIAN,
    UserRole.PATIENT,
  ],
  [Module.BILLING]: [UserRole.ADMIN, UserRole.RECEPTIONIST],
  [Module.INVENTORY]: [UserRole.ADMIN, UserRole.PHARMACIST],
  [Module.SUPPLIERS]: [UserRole.ADMIN],
  [Module.INSURANCE]: [UserRole.ADMIN, UserRole.RECEPTIONIST],
  [Module.MEDICAL_RECORDS]: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT],
  [Module.SERVICES]: [UserRole.ADMIN],
};

/**
 * Checks if a user has a specific role
 * @param userRole - The user's role
 * @param requiredRole - The required role to check
 * @returns True if user has the required role
 */
export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

/**
 * Checks if a user can access a specific module
 * @param userRole - The user's role
 * @param module - The module to check access for
 * @returns True if user can access the module
 */
export function canAccessModule(userRole: string, module: Module): boolean {
  const allowedRoles = PERMISSION_MATRIX[module];
  return allowedRoles ? allowedRoles.includes(userRole as UserRole) : false;
}

/**
 * Checks if a user can access a specific route
 * @param userRole - The user's role
 * @param route - The route path (e.g., '/patients', '/doctors')
 * @returns True if user can access the route
 */
export function canAccessRoute(userRole: string, route: string): boolean {
  // Remove leading slash and get the base route
  const baseRoute = route.replace(/^\//, '').split('/')[0];
  
  // Map route to module
  const module = baseRoute as Module;
  
  return canAccessModule(userRole, module);
}

/**
 * Gets all modules accessible by a specific role
 * @param userRole - The user's role
 * @returns Array of accessible modules
 */
export function getAccessibleModules(userRole: string): Module[] {
  return Object.entries(PERMISSION_MATRIX)
    .filter(([_, roles]) => roles.includes(userRole as UserRole))
    .map(([module]) => module as Module);
}

/**
 * Checks if a user has any of the specified roles
 * @param userRole - The user's role
 * @param allowedRoles - Array of allowed roles
 * @returns True if user has any of the allowed roles
 */
export function hasAnyRole(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * Checks if a user is an admin
 * @param userRole - The user's role
 * @returns True if user is an admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Checks if a user is a medical professional (Doctor or Nurse)
 * @param userRole - The user's role
 * @returns True if user is a medical professional
 */
export function isMedicalProfessional(userRole: string): boolean {
  return userRole === UserRole.DOCTOR || userRole === UserRole.NURSE;
}

/**
 * Checks if a user can perform CRUD operations on a module
 * @param userRole - The user's role
 * @param module - The module to check
 * @param operation - The operation type ('create', 'read', 'update', 'delete')
 * @returns True if user can perform the operation
 */
export function canPerformOperation(
  userRole: string,
  module: Module,
  operation: 'create' | 'read' | 'update' | 'delete'
): boolean {
  // First check if user can access the module
  if (!canAccessModule(userRole, module)) {
    return false;
  }
  
  // Patients can only read their own data
  if (userRole === UserRole.PATIENT) {
    return operation === 'read';
  }
  
  // Lab technicians can create/update lab results but not delete
  if (userRole === UserRole.LAB_TECHNICIAN && module === Module.LAB_RESULTS) {
    return operation !== 'delete';
  }
  
  // Pharmacists can read/update prescriptions but not create/delete
  if (userRole === UserRole.PHARMACIST && module === Module.PRESCRIPTIONS) {
    return operation === 'read' || operation === 'update';
  }
  
  // Nurses can read/update patients and rooms but not delete
  if (userRole === UserRole.NURSE) {
    if (module === Module.PATIENTS || module === Module.ROOMS) {
      return operation !== 'delete';
    }
  }
  
  // Receptionists have full access to their modules
  if (userRole === UserRole.RECEPTIONIST) {
    return true;
  }
  
  // Doctors have full access to their modules
  if (userRole === UserRole.DOCTOR) {
    return true;
  }
  
  // Admins have full access to everything
  if (userRole === UserRole.ADMIN) {
    return true;
  }
  
  return false;
}

/**
 * Gets a user-friendly display name for a role
 * @param role - The role to get display name for
 * @returns Display name for the role
 */
export function getRoleDisplayName(role: string): string {
  const displayNames: Record<string, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.DOCTOR]: 'Doctor',
    [UserRole.NURSE]: 'Nurse',
    [UserRole.PATIENT]: 'Patient',
    [UserRole.RECEPTIONIST]: 'Receptionist',
    [UserRole.LAB_TECHNICIAN]: 'Lab Technician',
    [UserRole.PHARMACIST]: 'Pharmacist',
  };
  
  return displayNames[role] || role;
}

/**
 * Gets a user-friendly display name for a module
 * @param module - The module to get display name for
 * @returns Display name for the module
 */
export function getModuleDisplayName(module: Module): string {
  const displayNames: Record<Module, string> = {
    [Module.DASHBOARD]: 'Dashboard',
    [Module.PATIENTS]: 'Patients',
    [Module.DOCTORS]: 'Doctors',
    [Module.STAFF]: 'Staff',
    [Module.DEPARTMENTS]: 'Departments',
    [Module.ROOMS]: 'Rooms',
    [Module.APPOINTMENTS]: 'Appointments',
    [Module.PRESCRIPTIONS]: 'Prescriptions',
    [Module.LAB_RESULTS]: 'Lab Results',
    [Module.BILLING]: 'Billing',
    [Module.INVENTORY]: 'Inventory',
    [Module.SUPPLIERS]: 'Suppliers',
    [Module.INSURANCE]: 'Insurance',
    [Module.MEDICAL_RECORDS]: 'Medical Records',
    [Module.SERVICES]: 'Services',
  };
  
  return displayNames[module] || module;
}

/**
 * Checks if a user has permission based on role array
 * @param userRole - The user's role
 * @param allowedRoles - Array of allowed role strings
 * @returns True if user has any of the allowed roles
 */
export function hasPermission(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
