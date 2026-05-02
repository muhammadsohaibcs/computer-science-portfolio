import React, { useEffect, useState } from 'react';
import { Doctor, DoctorFormData } from '../../types/doctor.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

interface DoctorFormProps {
  doctor?: Doctor | null;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  onCancel: () => void;
  viewOnly?: boolean;
}

const SPECIALIZATIONS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Oncology','Radiology','Surgery','Dermatology','Psychiatry','Emergency Medicine','Internal Medicine','Gynecology','Urology','Ophthalmology','ENT','Anesthesiology','Pathology'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const DoctorForm: React.FC<DoctorFormProps> = ({ doctor, onSubmit, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<DoctorFormData>({
    name: '', specialization: [], bio: '',
    contact: { phone: '', email: '' },
    availability: { weekdays: [1,2,3,4,5], startTime: '09:00', endTime: '17:00' },
  });

  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name || '',
        specialization: doctor.specialization || [],
        bio: doctor.bio || '',
        contact: { phone: doctor.contact?.phone || '', email: doctor.contact?.email || '' },
        availability: {
          weekdays: doctor.availability?.weekdays || [1,2,3,4,5],
          startTime: doctor.availability?.startTime || '09:00',
          endTime: doctor.availability?.endTime || '17:00',
        },
      });
    }
  }, [doctor]);

  const set = (field: string, val: any) => {
    if (field.includes('.')) {
      const [p, c] = field.split('.');
      setForm(prev => ({ ...prev, [p]: { ...(prev as any)[p], [c]: val } }));
    } else {
      setForm(prev => ({ ...prev, [field]: val }));
    }
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const toggleDay = (day: number) => {
    const days = form.availability.weekdays.includes(day)
      ? form.availability.weekdays.filter(d => d !== day)
      : [...form.availability.weekdays, day].sort();
    setForm(p => ({ ...p, availability: { ...p.availability, weekdays: days } }));
  };

  const toggleSpec = (spec: string) => {
    setForm(p => ({
      ...p,
      specialization: p.specialization.includes(spec)
        ? p.specialization.filter(s => s !== spec)
        : [...p.specialization, spec],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.specialization.length) e.specialization = 'At least one specialization required';
    if (!form.contact.email.trim()) e['contact.email'] = 'Email is required';
    if (!form.contact.phone.trim()) e['contact.phone'] = 'Phone is required';
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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errors.submit && <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-xs text-red-700 dark:text-red-300">{errors.submit}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><Input label="Full Name" name="name" value={form.name} onChange={e => set('name', e.target.value)} required error={errors.name} placeholder="Dr. John Smith" /></div>
        <Input label="Email" name="contact.email" type="email" value={form.contact.email} onChange={e => set('contact.email', e.target.value)} required error={errors['contact.email']} placeholder="doctor@hospital.com" />
        <Input label="Phone" name="contact.phone" type="tel" value={form.contact.phone} onChange={e => set('contact.phone', e.target.value)} required error={errors['contact.phone']} />
      </div>

      {/* Specializations */}
      <div>
        <p className="text-xs font-600 text-slate-500 uppercase tracking-wider mb-2">Specializations {errors.specialization && <span className="text-red-500 ml-1 normal-case">{errors.specialization}</span>}</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map(s => (
            <button key={s} type="button" onClick={() => toggleSpec(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-500 border transition-all duration-100 ${form.specialization.includes(s) ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400 dark:hover:border-brand-600'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <Textarea label="Biography / Notes" name="bio" value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Brief professional bio..." />

      {/* Availability */}
      <div>
        <p className="text-xs font-600 text-slate-500 uppercase tracking-wider mb-3">Availability Schedule</p>
        <div className="flex gap-2 mb-4">
          {DAYS.map((d, i) => (
            <button key={d} type="button" onClick={() => toggleDay(i + 1)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-600 border transition-all ${form.availability.weekdays.includes(i + 1) ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-400'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Time" name="startTime" type="time" value={form.availability.startTime} onChange={e => set('availability.startTime', e.target.value)} />
          <Input label="End Time" name="endTime" type="time" value={form.availability.endTime} onChange={e => set('availability.endTime', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" loading={submitting}>{doctor ? 'Save Changes' : 'Add Doctor'}</Button>
      </div>
    </form>
  );
};

export default DoctorForm;
