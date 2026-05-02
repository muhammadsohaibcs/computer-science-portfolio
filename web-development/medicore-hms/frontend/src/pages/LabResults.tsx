import { Download, ExternalLink, FlaskConical, Paperclip, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createLabResult, deleteLabResult, downloadLabResultFile, getFilePreviewUrl, getLabResults } from '../api/lab-results.api';
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
import LabResultForm from '../components/modules/LabResultForm';
import useDebounce from '../hooks/useDebounce';
import { LabResult, LabResultFormData } from '../types/lab-result.types';
import { formatDate } from '../utils/formatters';

const STATUS_BADGE: Record<string, any> = { pending: 'yellow', 'in-progress': 'blue', completed: 'green', cancelled: 'red' };

const LabResults: React.FC = () => {
  const [items, setItems] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const dSearch = useDebounce(search, 350);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LabResult | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getLabResults({ page, limit: 15 });
      setItems(r.data); setTotalPages(r.pagination.totalPages); setTotalItems(r.pagination.totalItems);
    } catch { setToast({ msg: 'Failed to load lab results', type: 'error' }); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (data: LabResultFormData, onProgress?: (p: number) => void) => {
    await createLabResult(data, onProgress);
    setToast({ msg: 'Lab result created with attachments', type: 'success' });
    setShowForm(false); fetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteLabResult(deleteTarget._id); setToast({ msg: 'Lab result deleted', type: 'success' }); setDeleteTarget(null); fetch(); }
    catch { setToast({ msg: 'Failed to delete', type: 'error' }); }
    finally { setDeleting(false); }
  };

  const columns: Column<LabResult>[] = [
    { key: 'patient', label: 'Patient', render: v => typeof v === 'object' ? v?.name || '—' : v },
    { key: 'testName', label: 'Test', sortable: true, render: v => <span className="font-600 text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'result', label: 'Result', render: v => <span className="font-mono text-xs">{v || '—'}</span> },
    { key: 'normalRange', label: 'Normal Range', render: v => v || '—' },
    { key: 'status', label: 'Status', render: v => v ? <Badge variant={STATUS_BADGE[v] || 'gray'} dot>{v}</Badge> : '—' },
    { key: 'performedAt', label: 'Date', render: v => v ? formatDate(v) : '—' },
    { key: 'attachments', label: 'Files', render: v => {
      const atts = v as { filename: string; url: string }[] || [];
      if (!atts.length) return <span className="text-slate-400 text-xs">No files</span>;
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {atts.map((a, i) => (
            <div key={i} className="flex items-center gap-1">
              <button onClick={e => { e.stopPropagation(); downloadLabResultFile(a.url, a.filename); }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors">
                <Download className="w-3 h-3" /> {a.filename.slice(0, 12)}{a.filename.length > 12 ? '…' : ''}
              </button>
              <a href={getFilePreviewUrl(a.url)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                className="p-0.5 rounded text-slate-400 hover:text-brand-600 transition-colors" title="Preview">
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      );
    }},
  ];

  return (
    <Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Lab Results" subtitle={`${totalItems} total results`} icon={<FlaskConical className="w-5 h-5" />}
        actions={<Button variant="primary" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Result</Button>} />
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <SearchBar value={search} onChange={setSearch} placeholder="Search results…" className="max-w-xs" />
        </div>
        {loading ? <Loading /> : items.length === 0 ? <EmptyState icon={FlaskConical} title="No lab results" message="Add your first lab result with attachments." actionLabel="Add Result" onAction={() => setShowForm(true)} /> : (
          <Table data={items} columns={columns} rowKey="_id" onDelete={setDeleteTarget}
            currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        )}
      </Card>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Lab Result" subtitle="Upload PDF reports or images as attachments" size="lg">
        <LabResultForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Lab Result" message={`Delete the lab result for "${deleteTarget?.testName}"?`} confirmText="Delete" loading={deleting} />
    </Layout>
  );
};

export default LabResults;
