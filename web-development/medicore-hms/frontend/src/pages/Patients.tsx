import { Eye, Plus, Users } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createPatient, deletePatient, getPatients, updatePatient } from '../api/patients.api';
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
import PatientForm from '../components/modules/PatientForm';
import { useAuth } from '../contexts/AuthContext';
import useDebounce from '../hooks/useDebounce';
import { Patient, PatientFormData } from '../types/patient.types';
import { formatDate } from '../utils/formatters';
import { hasPermission } from '../utils/permissions';

const BLOOD_BADGE: Record<string, any> = { 'A+': 'red', 'A-': 'orange', 'B+': 'blue', 'B-': 'purple', 'AB+': 'teal', 'AB-': 'green', 'O+': 'yellow', 'O-': 'gray' };

const Patients: React.FC = () => {
  const { role } = useAuth();
  const canWrite = hasPermission(role || '', ['Admin', 'Receptionist']);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const dSearch = useDebounce(search, 350);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPatients({ page, limit: 15, search: dSearch || undefined });
      setPatients(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch { setToast({ msg: 'Failed to load patients', type: 'error' }); }
    finally { setLoading(false); }
  }, [page, dSearch]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  useEffect(() => { setPage(1); }, [dSearch]);

  const handleSubmit = async (data: PatientFormData) => {
    if (editPatient) {
      await updatePatient(editPatient._id, data);
      setToast({ msg: 'Patient updated successfully', type: 'success' });
    } else {
      await createPatient(data);
      setToast({ msg: 'Patient added — login credentials emailed', type: 'success' });
    }
    setShowForm(false); setEditPatient(null);
    fetchPatients();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePatient(deleteTarget._id);
      setToast({ msg: 'Patient deleted', type: 'success' });
      setDeleteTarget(null);
      fetchPatients();
    } catch { setToast({ msg: 'Failed to delete patient', type: 'error' }); }
    finally { setDeleting(false); }
  };

  const columns: Column<Patient>[] = [
    { key: 'name', label: 'Patient', sortable: true, render: (v, p) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-700 flex-shrink-0">
          {p.name[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-600 text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
          <p className="text-xs text-slate-400 truncate">{p.contact?.email || '—'}</p>
        </div>
      </div>
    )},
    { key: 'dob', label: 'DOB', render: v => v ? formatDate(v) : '—' },
    { key: 'gender', label: 'Gender', render: v => <Badge variant={v === 'Male' ? 'blue' : v === 'Female' ? 'purple' : 'gray'}>{v || '—'}</Badge> },
    { key: 'bloodGroup', label: 'Blood', render: v => v ? <Badge variant={BLOOD_BADGE[v] || 'gray'}>{v}</Badge> : '—' },
    { key: 'contact', label: 'Phone', render: v => v?.phone || '—' },
    { key: 'primaryDoctor', label: 'Doctor', render: v => typeof v === 'object' && v?.name ? v.name : (typeof v === 'string' ? v : '—') },
  ];

  return (
    <Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Patients"
        subtitle={`${totalItems} registered patients`}
        icon={<Users className="w-5 h-5" />}
        actions={canWrite && (
          <Button variant="primary" onClick={() => { setEditPatient(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Patient
          </Button>
        )}
      />

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email…" className="max-w-xs" />
        </div>

        {loading ? <Loading text="Loading patients…" /> : patients.length === 0 ? (
          <EmptyState icon={Users} title="No patients yet" message={dSearch ? `No patients match "${dSearch}"` : 'Add your first patient to get started.'}
            actionLabel={canWrite ? 'Add Patient' : undefined} onAction={canWrite ? () => setShowForm(true) : undefined} />
        ) : (
          <Table
            data={patients} columns={columns} rowKey="_id"
            onView={(p) => setViewPatient(p)}
            onEdit={canWrite ? (p) => { setEditPatient(p); setShowForm(true); } : undefined}
            onDelete={canWrite ? setDeleteTarget : undefined}
            currentPage={page} totalPages={totalPages} totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditPatient(null); }}
        title={editPatient ? 'Edit Patient' : 'Add New Patient'}
        subtitle={editPatient ? `Editing ${editPatient.name}` : 'Patient will receive login credentials by email'}
        size="lg"
      >
        <PatientForm patient={editPatient} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditPatient(null); }} />
      </Modal>

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)}
        title="View Patient Details"
        subtitle={viewPatient?.name || ''}
        size="lg"
      >
        <PatientForm patient={viewPatient} onSubmit={handleSubmit} onCancel={() => setViewPatient(null)} viewOnly={true} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Patient" message={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove all their records permanently.`}
        confirmText="Delete Patient" loading={deleting} />
    </Layout>
  );
};

export default Patients;
