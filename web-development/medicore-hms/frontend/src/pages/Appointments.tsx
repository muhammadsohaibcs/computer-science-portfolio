import { Calendar, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createAppointment, deleteAppointment, getAppointments, updateAppointment } from '../api/appointments.api';
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
import AppointmentForm from '../components/modules/AppointmentForm';
import useDebounce from '../hooks/useDebounce';
import { Appointment, AppointmentFormData } from '../types/appointment.types';
import { formatDateTime } from '../utils/formatters';

const STATUS_BADGE: Record<string, any> = { Scheduled: 'blue', Completed: 'green', Cancelled: 'red', NoShow: 'yellow' };

const Appointments: React.FC = () => {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const dSearch = useDebounce(search, 350);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getAppointments({ page, limit: 15, search: dSearch || undefined });
      setItems(r.data); setTotalPages(r.pagination.totalPages); setTotalItems(r.pagination.totalItems);
    } catch { setToast({ msg: 'Failed to load appointments', type: 'error' }); }
    finally { setLoading(false); }
  }, [page, dSearch]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [dSearch]);

  const handleSubmit = async (data: AppointmentFormData) => {
    if (editItem) { await updateAppointment(editItem._id, data); setToast({ msg: 'Appointment updated', type: 'success' }); }
    else { await createAppointment(data); setToast({ msg: 'Appointment scheduled', type: 'success' }); }
    setShowForm(false); setEditItem(null); fetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteAppointment(deleteTarget._id); setToast({ msg: 'Appointment deleted', type: 'success' }); setDeleteTarget(null); fetch(); }
    catch { setToast({ msg: 'Failed to delete', type: 'error' }); }
    finally { setDeleting(false); }
  };

  const columns: Column<Appointment>[] = [
    { key: 'patient', label: 'Patient', render: v => typeof v === 'object' ? v?.name || '—' : v },
    { key: 'doctor', label: 'Doctor', render: v => typeof v === 'object' ? `Dr. ${v?.name || '—'}` : v },
    { key: 'appointmentDate', label: 'Date & Time', sortable: true, render: v => v ? formatDateTime(v) : '—' },
    { key: 'durationMinutes', label: 'Duration', render: v => v ? `${v} min` : '—' },
    { key: 'status', label: 'Status', render: v => <Badge variant={STATUS_BADGE[v] || 'gray'} dot>{v}</Badge> },
    { key: 'reason', label: 'Reason', render: v => <span className="truncate max-w-[180px] block">{v || '—'}</span> },
  ];

  return (
    <Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Appointments" subtitle={`${totalItems} total appointments`} icon={<Calendar className="w-5 h-5" />}
        actions={<Button variant="primary" onClick={() => { setEditItem(null); setShowForm(true); }}><Plus className="w-4 h-4" /> Schedule</Button>} />
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <SearchBar value={search} onChange={setSearch} placeholder="Search appointments…" className="max-w-xs" />
        </div>
        {loading ? <Loading /> : items.length === 0 ? <EmptyState icon={Calendar} title="No appointments" message={dSearch ? `No results for "${dSearch}"` : 'Schedule your first appointment.'} actionLabel="Schedule" onAction={() => setShowForm(true)} /> : (
          <Table data={items} columns={columns} rowKey="_id" onEdit={i => { setEditItem(i); setShowForm(true); }} onDelete={setDeleteTarget}
            currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        )}
      </Card>
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? 'Edit Appointment' : 'Schedule Appointment'} size="lg">
        <AppointmentForm appointment={editItem} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditItem(null); }} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Appointment" message="Are you sure you want to delete this appointment?" confirmText="Delete" loading={deleting} />
    </Layout>
  );
};

export default Appointments;
