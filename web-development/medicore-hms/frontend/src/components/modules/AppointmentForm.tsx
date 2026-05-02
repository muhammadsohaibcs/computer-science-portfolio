import { CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { checkDoctorAvailability } from '../../api/appointments.api';
import { getDoctors } from '../../api/doctors.api';
import { getPatients } from '../../api/patients.api';
import { Appointment, AppointmentFormData, AppointmentStatus } from '../../types/appointment.types';
import { Doctor } from '../../types/doctor.types';
import { Patient } from '../../types/patient.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, onSubmit, onCancel }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<{ checked: boolean; available: boolean; message: string }>({ checked: false, available: true, message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<AppointmentFormData>({ patient: '', doctor: '', appointmentDate: '', durationMinutes: 30, status: 'Scheduled', reason: '' });

  useEffect(() => {
    Promise.all([getPatients({ limit: 500 }), getDoctors({ limit: 500 })])
      .then(([p, d]) => { setPatients(p.data); setDoctors(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (appointment) {
      setForm({
        patient: appointment.patient, doctor: appointment.doctor,
        appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().slice(0, 16) : '',
        durationMinutes: appointment.durationMinutes, status: appointment.status, reason: appointment.reason || '',
      });
    }
  }, [appointment]);

  useEffect(() => {
    if (!form.doctor || !form.appointmentDate || !form.durationMinutes) return;
    const t = setTimeout(async () => {
      try {
        const r = await checkDoctorAvailability(form.doctor, form.appointmentDate, form.durationMinutes);
        setAvailability({ checked: true, available: r.available, message: r.message || '' });
      } catch { setAvailability({ checked: false, available: true, message: '' }); }
    }, 600);
    return () => clearTimeout(t);
  }, [form.doctor, form.appointmentDate, form.durationMinutes]);

  const set = (field: keyof AppointmentFormData, val: any) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patient) e.patient = 'Patient is required';
    if (!form.doctor) e.doctor = 'Doctor is required';
    if (!form.appointmentDate) e.appointmentDate = 'Date & time is required';
    if (!form.durationMinutes || form.durationMinutes <= 0) e.durationMinutes = 'Duration must be > 0';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try { await onSubmit(form); }
    catch (err: any) { setErrors({ submit: err?.message || 'Failed to save appointment' }); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.submit && <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-xs text-red-700 dark:text-red-300">{errors.submit}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Patient" name="patient" value={form.patient} onChange={e => set('patient', e.target.value)} required error={errors.patient}
          disabled={loading} placeholder={loading ? 'Loading…' : 'Select patient'}
          options={patients.map(p => ({ value: p._id, label: p.name }))} />
        <Select label="Doctor" name="doctor" value={form.doctor} onChange={e => set('doctor', e.target.value)} required error={errors.doctor}
          disabled={loading} placeholder={loading ? 'Loading…' : 'Select doctor'}
          options={doctors.map(d => ({ value: d._id, label: `${d.name} — ${d.specialization.slice(0,2).join(', ')}` }))} />
        <Input label="Date & Time" name="appointmentDate" type="datetime-local" value={form.appointmentDate}
          onChange={e => set('appointmentDate', e.target.value)} required error={errors.appointmentDate} />
        <Input label="Duration (minutes)" name="durationMinutes" type="number" value={String(form.durationMinutes)}
          onChange={e => set('durationMinutes', parseInt(e.target.value) || 0)} required error={errors.durationMinutes} min="5" step="5" />
      </div>

      {/* Availability feedback */}
      {availability.checked && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-500 ${availability.available ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          {availability.available ? 'Doctor is available at this time' : (availability.message || 'Doctor is not available at this time')}
        </div>
      )}

      <Select label="Status" name="status" value={form.status} onChange={e => set('status', e.target.value as AppointmentStatus)} required
        options={[{ value:'Scheduled', label:'Scheduled' },{ value:'Completed', label:'Completed' },{ value:'Cancelled', label:'Cancelled' },{ value:'NoShow', label:'No Show' }]} />
      <Textarea label="Reason for Visit" name="reason" value={form.reason || ''} onChange={e => set('reason', e.target.value)} rows={3} placeholder="Describe the reason for this appointment…" />

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" loading={submitting}>{appointment ? 'Update Appointment' : 'Create Appointment'}</Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
