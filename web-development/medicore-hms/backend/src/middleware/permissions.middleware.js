/**
 * permissions.middleware.js
 *
 * Provides a detailed Role-Based Access System (RBAC).
 *
 * Lab Manual Mapping:
 * - Lab 13 (Views & DB Security): Emphasizes role-based permissions.
 * - This RBAC middleware enforces permissions BEFORE reaching controllers.
 */

const RBAC = {
  Admin: ['*'], // Full access to everything

  HOD: [
    // Department management
    'departments:view',
    'departments:update:own',
    
    // Staff management (own department only)
    'staff:view',
    'staff:create:own',
    'staff:update:own',
    'staff:delete:own',
    
    // Doctor management (own department)
    'doctors:view',
    'doctors:update:own',
    
    // Patient and appointment access
    'patients:view',
    'patients:update',
    'appointments:view',
    'appointments:manage',
    
    // Medical records
    'records:view',
    'records:create',
    
    // Prescriptions and lab
    'prescriptions:write',
    'lab:orders:create',
    
    // Rooms and billing
    'rooms:view',
    'bills:view',
    
    // Analytics for own department
    'analytics:view:own'
  ],

  Doctor: [
    'patients:view',
    'patients:update',
    'appointments:view',
    'appointments:manage',
    'appointments:refer',
    'records:view',
    'records:create',
    'prescriptions:write',
    'lab:orders:create',
    'departments:view',
    'rooms:view',
    'staff:view',
    'bills:view'
  ],

  Nurse: [
    'patients:view',
    'patients:create',
    'patients:update',
    'records:view',
    'departments:view',
    'rooms:view',
    'rooms:assign',
    'rooms:release',
    'appointments:view',
    'vitals:record'
  ],

  Receptionist: [
    'patients:create',
    'patients:view',
    'patients:update',
    'appointments:view',
    'appointments:create',
    'appointments:approve',
    'appointments:reject',
    'bills:view',
    'bills:create',
    'bills:payment',
    'departments:view',
    'doctors:view',
    'rooms:view',
    'rooms:assign',
    'rooms:release',
    'admissions:create',
    'admissions:discharge'
  ],

  Patient: [
    'appointments:self',
    'appointments:create',
    'appointments:cancel',
    'records:self',
    'bills:self',
    'bills:payment:self',
    'profile:update:self'
  ],

  'Lab Technician': [
    'lab:orders:view',
    'lab:results:create',
    'lab:results:update',
    'lab:tests:manage',
    'patients:view'
  ],

  Pharmacist: [
    'prescriptions:view',
    'prescriptions:fulfill',
    'inventory:view',
    'inventory:create',
    'inventory:update',
    'inventory:delete',
    'medicines:manage',
    'patients:view',
    'bills:create:pharmacy'
  ]
};

module.exports.checkPermission = (permission) => {
  const authMiddleware = require('./auth.middleware');
  
  return [
    authMiddleware(), // First authenticate
    (req, res, next) => {
      const role = req.user?.role;
      if (!role) return res.status(401).json({ error: 'User role missing in request' });

      const allowed = RBAC[role];

      if (!allowed)
        return res.status(403).json({ error: 'Unknown role' });

      if (allowed.includes('*') || allowed.includes(permission)) return next();

      return res.status(403).json({ error: 'Forbidden: permission denied' });
    }
  ];
};

module.exports.RBAC = RBAC;
