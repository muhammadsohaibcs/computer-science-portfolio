import { Plus, Users2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createStaff, deleteStaff, getStaff, updateStaff } from '../api/staff.api';
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
import StaffForm from '../components/modules/StaffForm';
import useDebounce from '../hooks/useDebounce';
import { Staff, StaffFormData } from '../types/staff.types';

const ROLE_COLORS: Record<string, any> = { Nurse: 'blue', Receptionist: 'green', 'Lab Technician': 'purple', Pharmacist: 'orange', HOD: 'red' };

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const dSearch = useDebounce(search, 350);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getStaff({ page, limit: 15, search: dSearch || undefined });
      setStaff(r.data); setTotalPages(r.pagination.totalPages); setTotalItems(r.pagination.totalItems);
    } catch { setToast({ msg: 'Failed to load staff', type: 'error' }); }
    finally { setLoading(false); }
  }, [page, dSearch]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [dSearch]);

  const handleSubmit = async (data: StaffFormData) => {
    if (editStaff) { await updateStaff(editStaff._id, data); setToast({ msg: 'Staff updated', type: 'success' }); }
    else { await createStaff(data); setToast({ msg: 'Staff member added', type: 'success' }); }
    setShowForm(false); setEditStaff(null); fetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteStaff(deleteTarget._id); setToast({ msg: 'Staff member deleted', type: 'success' }); setDeleteTarget(null); fetch(); }
    catch { setToast({ msg: 'Failed to delete', type: 'error' }); }
    finally { setDeleting(false); }
  };

  const columns: Column<Staff>[] = [
    { key: 'name', label: 'Name', sortable: true, render: (v, s) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-700">{s.name[0]}</div>
        <span className="text-sm font-600 text-slate-800 dark:text-slate-200">{s.name}</span>
      </div>
    )},
    { key: 'roleTitle', label: 'Role', render: v => v ? <Badge variant={ROLE_COLORS[v] || 'gray'}>{v}</Badge> : '—' },
    { key: 'department', label: 'Department', render: v => typeof v === 'object' && v?.name ? v.name : (v || '—') },
  ];

  return (
    <Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Staff" subtitle={`${totalItems} staff members`} icon={<Users2 className="w-5 h-5" />}
        actions={<Button variant="primary" onClick={() => { setEditStaff(null); setShowForm(true); }}><Plus className="w-4 h-4" /> Add Staff</Button>} />
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <SearchBar value={search} onChange={setSearch} placeholder="Search staff…" className="max-w-xs" />
        </div>
        {loading ? <Loading /> : staff.length === 0 ? <EmptyState icon={Users2} title="No staff" message={dSearch ? `No match for "${dSearch}"` : 'Add staff members.'} actionLabel="Add Staff" onAction={() => setShowForm(true)} /> : (
          <Table data={staff} columns={columns} rowKey="_id" onEdit={s => { setEditStaff(s); setShowForm(true); }} onDelete={setDeleteTarget}
            currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        )}
      </Card>
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditStaff(null); }} title={editStaff ? 'Edit Staff' : 'Add Staff Member'} size="md">
        <StaffForm staff={editStaff} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditStaff(null); }} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Staff Member" message={`Delete "${deleteTarget?.name}"?`} confirmText="Delete" loading={deleting} />
    </Layout>
  );
};

export default StaffPage;
