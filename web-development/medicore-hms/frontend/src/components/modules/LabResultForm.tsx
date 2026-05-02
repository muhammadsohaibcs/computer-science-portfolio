import { FileText, Paperclip, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { getPatients } from '../../api/patients.api';
import { LabResult, LabResultFormData } from '../../types/lab-result.types';
import { Patient } from '../../types/patient.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';

interface LabResultFormProps {
  labResult?: LabResult | null;
  onSubmit: (data: LabResultFormData, onProgress?: (p: number) => void) => Promise<void>;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LabResultForm: React.FC<LabResultFormProps> = ({ labResult, onSubmit, onCancel }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<LabResultFormData>({
    patient: '', testName: '', result: '', normalRange: '', units: '',
    performedBy: '', performedAt: new Date().toISOString().split('T')[0],
    status: 'Pending', attachments: [],
  });

  useEffect(() => {
    getPatients({ limit: 500 }).then(r => setPatients(r.data)).catch(console.error).finally(() => setLoadingPatients(false));
  }, []);

  useEffect(() => {
    if (labResult) {
      setForm({
        patient: labResult.patient || '',
        testName: labResult.testName || '',
        result: labResult.result || '',
        normalRange: labResult.normalRange || '',
        units: labResult.units || '',
        performedBy: labResult.performedBy || '',
        performedAt: labResult.performedAt ? labResult.performedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: labResult.status || 'pending',
        attachments: [],
      });
    }
  }, [labResult]);

  const set = (field: keyof LabResultFormData, val: any) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'));
    setFiles(p => [...p, ...accepted]);
  };

  const removeFile = (i: number) => setFiles(p => p.filter((_, idx) => idx !== i));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patient) e.patient = 'Patient is required';
    if (!form.testName.trim()) e.testName = 'Test name is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setUploadProgress(0);
    try {
      await onSubmit({ ...form, attachments: files }, (p) => setUploadProgress(p));
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Failed to save lab result' });
    } finally { setSubmitting(false); }
  };

  const fmtSize = (b: number) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.submit && <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-xs text-red-700 dark:text-red-300">{errors.submit}</div>}

      <Select label="Patient" name="patient" value={form.patient} onChange={e => set('patient', e.target.value)} required error={errors.patient}
        disabled={loadingPatients} placeholder={loadingPatients ? 'Loading…' : 'Select patient'}
        options={patients.map(p => ({ value: p._id, label: p.name }))} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Test Name" name="testName" value={form.testName} onChange={e => set('testName', e.target.value)} required error={errors.testName} placeholder="e.g. Complete Blood Count" />
        <Select label="Status" name="status" value={form.status || 'pending'} onChange={e => set('status', e.target.value)} options={STATUS_OPTIONS} />
        <Input label="Performed Date" name="performedAt" type="date" value={form.performedAt} onChange={e => set('performedAt', e.target.value)} />
        <Input label="Performed By" name="performedBy" value={form.performedBy || ''} onChange={e => set('performedBy', e.target.value)} placeholder="Technician name" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Textarea label="Result" name="result" value={form.result || ''} onChange={e => set('result', e.target.value)} rows={2} placeholder="Test result…" />
        <Input label="Normal Range" name="normalRange" value={form.normalRange || ''} onChange={e => set('normalRange', e.target.value)} placeholder="e.g. 4.0 - 11.0" />
        <Input label="Units" name="units" value={form.units || ''} onChange={e => set('units', e.target.value)} placeholder="e.g. g/dL, mmol/L" />
      </div>

      {/* File upload */}
      <div>
        <p className="label mb-2">Attachments <span className="normal-case text-slate-400 font-400">(PDF, images)</span></p>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${dragOver ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Drop files here or <span className="text-brand-600 dark:text-brand-400 font-500">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">PDF and images up to 20 MB each</p>
          <input ref={fileRef} type="file" multiple accept="application/pdf,image/*" onChange={e => handleFiles(e.target.files)} className="hidden" />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-500 text-slate-700 dark:text-slate-300 truncate">{f.name}</p>
                  <p className="text-2xs text-slate-400">{fmtSize(f.size)}</p>
                </div>
                <button type="button" onClick={() => removeFile(i)} className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}

        {/* Existing attachments */}
        {labResult?.attachments && labResult.attachments.length > 0 && (
          <div className="mt-2">
            <p className="text-2xs text-slate-400 mb-1.5">Existing files:</p>
            {labResult.attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 mb-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline truncate">{a.filename}</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload progress */}
      {submitting && uploadProgress > 0 && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Uploading…</span><span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="bg-brand-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" loading={submitting}>{labResult ? 'Update Result' : 'Create Result'}</Button>
      </div>
    </form>
  );
};

export default LabResultForm;
