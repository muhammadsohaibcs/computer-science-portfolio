import React, { useEffect, useState } from 'react';
import { getDepartments } from '../../api/departments.api';
import { Department } from '../../types/department.types';
import { Staff, StaffFormData } from '../../types/staff.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface StaffFormProps {
  staff?: Staff | null;
  onSubmit: (data: StaffFormData) => Promise<void>;
  onCancel: () => void;
}

const ROLES = ['Nurse','Receptionist','Lab Technician','Pharmacist','HOD'];

const StaffForm: React.FC<StaffFormProps> = ({ staff, onSubmit, onCancel }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<StaffFormData>({ name: '', roleTitle: '', department: '' });

  useEffect(() => {
    getDepartments({ limit: 500 }).then(r => setDepartments(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (staff) setForm({ name: staff.name || '', roleTitle: staff.roleTitle || '', department: staff.department || '' });
  }, [staff]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try { await onSubmit(form); }
    catch (err: any) { setErrors({ submit: err?.message || 'Failed to save' }); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.submit && <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-xs text-red-700 dark:text-red-300">{errors.submit}</div>}
      <Input label="Full Name" name="name" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if(errors.name) setErrors(p => { const n = {...p}; delete n.name; return n; }); }} required error={errors.name} placeholder="Jane Smith" />
      <Select label="Role" name="roleTitle" value={form.roleTitle || ''} onChange={e => setForm(p => ({ ...p, roleTitle: e.target.value }))}
        options={ROLES.map(r => ({ value: r, label: r }))} placeholder="Select role" />
      <Select label="Department" name="department" value={form.department || ''} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
        options={departments.map(d => ({ value: d._id, label: d.name }))} placeholder="Select department" />
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" loading={submitting}>{staff ? 'Save Changes' : 'Add Staff'}</Button>
      </div>
    </form>
  );
};

export default StaffForm;
