import React, { useEffect, useState } from 'react';
import { getDoctors } from '../../api/doctors.api';
import { Doctor } from '../../types/doctor.types';
import { Patient, PatientFormData } from '../../types/patient.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';

interface PatientFormProps {
  patient?: Patient | null;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
  viewOnly?: boolean;
}

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const GENDERS = ['Male','Female','Other'];

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSubmit, onCancel, viewOnly = false }) => {
  const isEdit = !!patient;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<PatientFormData>({
    name: '', dob: '', gender: '', bloodGroup: '', primaryDoctor: '',
    contact: { phone: '', email: '', address: '' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    medicalHistory: [], allergies: [], notes: '',
  });

  useEffect(() => {
    getDoctors({ limit: 500 }).then(r => setDoctors(r.data)).catch(console.error).finally(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || '',
        dob: patient.dob ? patient.dob.split('T')[0] : '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        primaryDoctor: typeof patient.primaryDoctor === 'string' ? patient.primaryDoctor : (patient.primaryDoctor as any)?._id || '',
        contact: { phone: patient.contact?.phone || '', email: patient.contact?.email || '', address: patient.contact?.address || '' },
        emergencyContact: { name: patient.emergencyContact?.name || '', phone: patient.emergencyContact?.phone || '', relationship: patient.emergencyContact?.relationship || '' },
        medicalHistory: patient.medicalHistory || [],
        allergies: patient.allergies || [],
        notes: patient.notes || '',
      });
    }
  }, [patient]);

  const set = (field: string, val: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setForm(p => ({ ...p, [parent]: { ...(p as any)[parent], [child]: val } }));
    } else {
      setForm(p => ({ ...p, [field]: val }));
    }
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.dob) e.dob = 'Date of birth is required';
    if (!form.gender) e.gender = 'Gender is required';
    if (!form.primaryDoctor) e.primaryDoctor = 'Primary doctor is required';
    if (!form.contact.email.trim()) e['contact.email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email)) e['contact.email'] = 'Invalid email';
    if (!form.contact.phone.trim()) e['contact.phone'] = 'Phone is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try { await onSubmit(form); }
    catch (err: any) { setErrors({ submit: err?.message || 'Failed to save patient' }); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {!isEdit && (
        <div className="rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 px-4 py-3">
          <p className="text-xs text-brand-700 dark:text-brand-300 font-500">
            📧 An email with login credentials will be automatically sent to the patient's email address upon creation.
          </p>
        </div>
      )}

      {errors.submit && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-3">
          <p className="text-xs text-red-700 dark:text-red-300">{errors.submit}</p>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <p className="text-xs font-600 text-slate-500 uppercase tracking-wider mb-3">Basic Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" name="name" value={form.name} onChange={e => set('name', e.target.value)} required error={errors.name} placeholder="John Doe" disabled={viewOnly} />
          <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} required error={errors.dob} disabled={viewOnly} />
          <Select label="Gender" name="gender" value={form.gender} onChange={e => set('gender', e.target.value)} required error={errors.gender}
            options={GENDERS.map(g => ({ value: g, label: g }))} placeholder="Select gender" disabled={viewOnly} />
          <Select label="Blood Group" name="bloodGroup" value={form.bloodGroup || ''} onChange={e => set('bloodGroup', e.target.value)}
            options={BLOOD_GROUPS.map(b => ({ value: b, label: b }))} placeholder="Select blood group" disabled={viewOnly} />
        </div>
      </div>

      {/* Primary Doctor */}
      <div>
        <p className="text-xs font-600 text-slate-500 uppercase tracking-wider mb-3">Assigned Doctor</p>
        <Select
          label="Primary Doctor" name="primaryDoctor" value={form.primaryDoctor}
          onChange={e => set('primaryDoctor', e.target.value)} required error={errors.primaryDoctor}
          disabled={viewOnly || loadingDoctors}
          placeholder={loadingDoctors ? 'Loading doctors…' : 'Select primary doctor'}
          options={doctors.map(d => ({ value: d._id, label: `${d.name} — ${d.specialization.join(', ')}` }))}
        />
      </div>

      {/* Contact */}
      <div>
        <p className="text-xs font-600 text-slate-500 uppercase tracking-wider mb-3">Contact Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email" name="contact.email" type="email" value={form.contact.email} onChange={e => set('contact.email', e.target.value)} required error={errors['contact.email']} placeholder="patient@email.com" disabled={viewOnly} />
          <Input label="Phone" name="contact.phone" type="tel" value={form.contact.phone} onChange={e => set('contact.phone', e.target.value)} required error={errors['contact.phone']} placeholder="+1 555 000 0000" disabled={viewOnly} />
          <div className="sm:col-span-2">
            <Input label="Address" name="contact.address" value={form.contact.address} onChange={e => set('contact.address', e.target.value)} placeholder="123 Main St, City, State" disabled={viewOnly} />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <p className="text-xs font-600 text-slate-500 uppercase tracking-wider mb-3">Emergency Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Name" name="emergencyContact.name" value={form.emergencyContact.name} onChange={e => set('emergencyContact.name', e.target.value)} placeholder="Jane Doe" disabled={viewOnly} />
          <Input label="Phone" name="emergencyContact.phone" type="tel" value={form.emergencyContact.phone} onChange={e => set('emergencyContact.phone', e.target.value)} placeholder="+1 555 000 0000" disabled={viewOnly} />
          <Input label="Relationship" name="emergencyContact.relationship" value={form.emergencyContact.relationship || ''} onChange={e => set('emergencyContact.relationship', e.target.value)} placeholder="Spouse, Parent…" disabled={viewOnly} />
        </div>
      </div>

      {/* Notes */}
      <Textarea label="Notes / Medical History Summary" name="notes" value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Any relevant notes…" rows={3} disabled={viewOnly} />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>{viewOnly ? 'Close' : 'Cancel'}</Button>
        {!viewOnly && <Button type="submit" variant="primary" loading={submitting}>{isEdit ? 'Save Changes' : 'Add Patient'}</Button>}
      </div>
    </form>
  );
};

export default PatientForm;
