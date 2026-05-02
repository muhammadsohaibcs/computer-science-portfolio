/**
 * Medical Records Page Component
 * Manages medical records with CRUD operations and chronological display
 */

import { Calendar, FileText, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createMedicalRecord,
    deleteMedicalRecord,
    getMedicalRecords,
    updateMedicalRecord,
} from '../api/medical-records.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import MedicalRecordForm from '../components/modules/MedicalRecordForm';
import { ApiError } from '../types/api.types';
import { MedicalRecord, MedicalRecordFormData } from '../types/medical-record.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Medical Records Page Component
 */
export default function MedicalRecords(): JSX.Element {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches medical records from the API
   */
  const fetchMedicalRecords = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMedicalRecords({
        page,
        limit: 10,
        search: search || undefined,
      });

      setMedicalRecords(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load medical records');
      console.error('Medical records fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMedicalRecords(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Handles page change
   */
  const handlePageChange = (page: number) => {
    fetchMedicalRecords(page, searchQuery);
  };

  /**
   * Opens modal for creating a new medical record
   */
  const handleCreate = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing a medical record
   */
  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (record: MedicalRecord) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handles medical record form submission
   */
  const handleFormSubmit = async (data: MedicalRecordFormData) => {
    try {
      if (selectedRecord) {
        // Update existing record
        await updateMedicalRecord(selectedRecord._id, data);
        setToast({
          show: true,
          message: 'Medical record updated successfully',
          type: 'success',
        });
      } else {
        // Create new record
        await createMedicalRecord(data);
        setToast({
          show: true,
          message: 'Medical record created successfully',
          type: 'success',
        });
      }

      setIsModalOpen(false);
      setSelectedRecord(null);
      fetchMedicalRecords(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      setToast({
        show: true,
        message: apiError.message || 'Failed to save medical record',
        type: 'error',
      });
      throw err;
    }
  };

  /**
   * Handles medical record deletion
   */
  const handleDelete = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMedicalRecord(recordToDelete._id);
      setToast({
        show: true,
        message: 'Medical record deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchMedicalRecords(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      setToast({
        show: true,
        message: apiError.message || 'Failed to delete medical record',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Formats date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Table columns configuration
   */
  const columns: Column<MedicalRecord>[] = [
    {
      key: 'visitDate',
      label: 'Visit Date',
      sortable: true,
      render: (_value: unknown, record: MedicalRecord) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(record.visitDate)}</span>
        </div>
      ),
    },
    {
      key: 'patient',
      label: 'Patient ID',
      sortable: true,
    },
    {
      key: 'doctor',
      label: 'Doctor ID',
      sortable: true,
    },
    {
      key: 'diagnosis',
      label: 'Diagnosis',
      render: (_value: unknown, record: MedicalRecord) => (
        <div className="max-w-xs truncate" title={record.diagnosis}>
          {record.diagnosis}
        </div>
      ),
    },
    {
      key: 'treatment',
      label: 'Treatment',
      render: (_value: unknown, record: MedicalRecord) => (
        <div className="max-w-xs truncate" title={record.treatment}>
          {record.treatment}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (_value: unknown, record: MedicalRecord) => formatDate(record.updatedAt),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage patient medical history and clinical records
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient ID, doctor ID, or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Medical Records Table */}
        <Card>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button variant="outline" onClick={() => fetchMedicalRecords(1, searchQuery)} className="mt-4">
                Retry
              </Button>
            </div>
          ) : medicalRecords.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No medical records found"
              message={
                searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first medical record'
              }
              actionLabel={!searchQuery ? 'Create Medical Record' : undefined}
              onAction={!searchQuery ? handleCreate : undefined}
            />
          ) : (
            <Table
              columns={columns}
              data={medicalRecords}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRecord(null);
          }}
          title={selectedRecord ? 'Edit Medical Record' : 'Create Medical Record'}
          size="lg"
        >
          <MedicalRecordForm
            medicalRecord={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedRecord(null);
            }}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setRecordToDelete(null);
          }}
          onConfirm={handleDelete}
          title="Delete Medical Record"
          message={`Are you sure you want to delete this medical record? This action cannot be undone.`}
          confirmText="Delete"
          loading={isDeleting}
        />

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </Layout>
  );
}
