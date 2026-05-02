import { Eye, Plus, Stethoscope } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from '../api/doctors.api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import DoctorForm from '../components/modules/DoctorForm';
import useDebounce from '../hooks/useDebounce';
import { Doctor, DoctorFormData } from '../types/doctor.types';

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const dSearch = useDebounce(search, 350);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState<Doctor | null>(null);
  const [viewDoc, setViewDoc] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getDoctors({ page, limit: 15, search: dSearch || undefined });
      setDoctors(r.data); setTotalPages(r.pagination.totalPages); setTotalItems(r.pagination.totalItems);
    } catch { setToast({ msg: 'Failed to load doctors', type: 'error' }); }
    finally { setLoading(false); }
  }, [page, dSearch]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [dSearch]);

  const handleSubmit = async (data: DoctorFormData) => {
    if (editDoc) { await updateDoctor(editDoc._id, data); setToast({ msg: 'Doctor updated', type: 'success' }); }
    else { await createDoctor(data); setToast({ msg: 'Doctor added', type: 'success' }); }
    setShowForm(false); setEditDoc(null); fetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteDoctor(deleteTarget._id); setToast({ msg: 'Doctor deleted', type: 'success' }); setDeleteTarget(null); fetch(); }
    catch { setToast({ msg: 'Failed to delete', type: 'error' }); }
    finally { setDeleting(false); }
  };

  const columns: Column<Doctor>[] = [
    { key: 'name', label: 'Doctor', sortable: true, render: (v, d) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-700">{d.name[0]}</div>
        <div>
          <p className="text-sm font-600 text-slate-800 dark:text-slate-200">{d.name}</p>
          <p className="text-xs text-slate-400">{d.contact?.email || '—'}</p>
        </div>
      </div>
    )},
    { key: 'specialization', label: 'Specialization', render: v => (
      <div className="flex flex-wrap gap-1">{(v as string[]).slice(0, 2).map((s: string) => <Badge key={s} variant="teal">{s}</Badge>)}{(v as string[]).length > 2 && <Badge variant="gray">+{(v as string[]).length - 2}</Badge>}</div>
    )},
    { key: 'contact', label: 'Phone', render: v => v?.phone || '—' },
    { key: 'availability', label: 'Schedule', render: v => (
      <div className="flex gap-0.5">{(v?.weekdays || []).map((d: number) => <span key={d} className="text-2xs px-1 py-0.5 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded font-600">{DAYS[d]}</span>)}</div>
    )},
  ];

  return (
    <Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Doctors" subtitle={`${totalItems} physicians`} icon={<Stethoscope className="w-5 h-5" />}
        actions={<Button variant="primary" onClick={() => { setEditDoc(null); setShowForm(true); }}><Plus className="w-4 h-4" /> Add Doctor</Button>} />
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <SearchBar value={search} onChange={setSearch} placeholder="Search doctors…" className="max-w-xs" />
        </div>
        {loading ? <Loading /> : doctors.length === 0 ? <EmptyState icon={Stethoscope} title="No doctors" message={dSearch ? `No match for "${dSearch}"` : 'Add your first doctor.'} actionLabel="Add Doctor" onAction={() => setShowForm(true)} /> : (
          <Table data={doctors} columns={columns} rowKey="_id" onView={d => setViewDoc(d)} onEdit={d => { setEditDoc(d); setShowForm(true); }} onDelete={setDeleteTarget}
            currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        )}
      </Card>
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditDoc(null); }} title={editDoc ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <DoctorForm doctor={editDoc} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditDoc(null); }} />
      </Modal>
      <Modal isOpen={!!viewDoc} onClose={() => setViewDoc(null)} title="View Doctor Details" subtitle={viewDoc?.name || ''} size="lg">
        <DoctorForm doctor={viewDoc} onSubmit={handleSubmit} onCancel={() => setViewDoc(null)} viewOnly={true} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Doctor" message={`Delete Dr. "${deleteTarget?.name}"? This action cannot be undone.`} confirmText="Delete" loading={deleting} />
    </Layout>
  );
};

export default Doctors;
