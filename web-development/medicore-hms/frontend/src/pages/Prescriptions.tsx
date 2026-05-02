/**
 * Prescriptions Page Component
 * Manages prescription records with CRUD operations
 */

import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  createPrescription,
  deletePrescription,
  getPrescriptions,
  updatePrescription,
} from '../api/prescriptions.api';
import { getDoctors } from '../api/doctors.api';
import { getPatients } from '../api/patients.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import PrescriptionForm from '../components/modules/PrescriptionForm';
import { ApiError } from '../types/api.types';
import { Prescription, PrescriptionFormData } from '../types/prescription.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface PrescriptionWithDetails extends Prescription {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialization: string;
}

export default function Prescriptions(): JSX.Element {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>([]);
  const [patients, setPatients] = useState<{ _id: string; name: string; contact?: { email?: string } }[]>([]);
  const [doctors, setDoctors] = useState<{ _id: string; name: string; specialization: string[] }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refDataLoaded, setRefDataLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const enrichPrescriptions = useCallback(
    (raw: Prescription[]): PrescriptionWithDetails[] =>
      raw.map((p) => {
        const patient = patients.find((pt) => pt._id === p.patient);
        const doctor = doctors.find((d) => d._id === p.doctor);
        return {
          ...p,
          patientName: patient?.name ?? 'Unknown Patient',
          patientEmail: patient?.contact?.email ?? '',
          doctorName: doctor?.name ?? 'Unknown Doctor',
          doctorSpecialization: doctor?.specialization?.join(', ') ?? '',
        };
      }),
    [patients, doctors]
  );

  /** Load reference data (patients + doctors) once, using the proper apiClient */
  useEffect(() => {
    const loadRefData = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          getPatients({ limit: 500 }),
          getDoctors({ limit: 500 }),
        ]);
        setPatients(pRes.data ?? []);
        setDoctors(dRes.data ?? []);
      } catch (err) {
        console.error('Failed to load reference data:', err);
        showToast('Could not load patients/doctors list', 'warning');
      } finally {
        setRefDataLoaded(true);
      }
    };
    loadRefData();
  }, []);

  const fetchPrescriptions = useCallback(
    async (page = 1, search = '') => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPrescriptions({ page, limit: 10, search: search || undefined });
        setPrescriptions(enrichPrescriptions(response.data));
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message ?? 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    },
    [enrichPrescriptions]
  );

  /** Fetch prescriptions only after reference data is ready */
  useEffect(() => {
    if (refDataLoaded) {
      fetchPrescriptions(1, '');
    }
  }, [refDataLoaded, fetchPrescriptions]);

  /** Debounced search — reset to page 1 */
  useEffect(() => {
    if (!refDataLoaded) return;
    const id = setTimeout(() => fetchPrescriptions(1, searchQuery), 500);
    return () => clearTimeout(id);
  }, [searchQuery, refDataLoaded, fetchPrescriptions]);

  const handlePageChange = (page: number) => fetchPrescriptions(page, searchQuery);

  const handleCreateClick = () => {
    setSelectedPrescription(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (prescription: PrescriptionWithDetails) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (prescription: PrescriptionWithDetails) => {
    setPrescriptionToDelete(prescription);
    setIsDeleteDialogOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPrescription(null);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setPrescriptionToDelete(null);
  };

  const handleFormSubmit = async (data: PrescriptionFormData) => {
    try {
      if (selectedPrescription) {
        await updatePrescription(selectedPrescription._id, data);
        showToast('Prescription updated successfully', 'success');
      } else {
        await createPrescription(data);
        showToast('Prescription created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedPrescription(null);
      fetchPrescriptions(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Failed to save prescription', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;
    try {
      setIsDeleting(true);
      await deletePrescription(prescriptionToDelete._id);
      showToast('Prescription deleted successfully', 'success');
      handleDeleteDialogClose();
      fetchPrescriptions(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Failed to delete prescription', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const showToast = (message: string, type: ToastState['type']) =>
    setToast({ show: true, message, type });

  const closeToast = () => setToast((t) => ({ ...t, show: false }));

  const columns: Column<PrescriptionWithDetails>[] = [
    {
      key: 'patientName',
      label: 'Patient',
      sortable: true,
      render: (value: string, item: PrescriptionWithDetails) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          {item.patientEmail && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{item.patientEmail}</div>
          )}
        </div>
      ),
    },
    {
      key: 'doctorName',
      label: 'Doctor',
      sortable: true,
      render: (value: string, item: PrescriptionWithDetails) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          {item.doctorSpecialization && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{item.doctorSpecialization}</div>
          )}
        </div>
      ),
    },
    {
      key: 'drugs',
      label: 'Medications',
      render: (value: Prescription['drugs'] | undefined) => (
        <div className="space-y-1">
          {value?.slice(0, 2).map((drug, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{drug.name}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                {drug.dose} × {drug.qty}
              </span>
            </div>
          ))}
          {value && value.length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">+{value.length - 2} more</div>
          )}
          {!value && <span className="text-gray-400">No medications</span>}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value?: string) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
          {value || '-'}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage prescription records and medications
          </p>
        </div>

        {/* Search and Actions */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient, doctor or medication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search prescriptions"
              />
            </div>
            <Button onClick={handleCreateClick} variant="primary" size="md" ariaLabel="Create new prescription">
              <Plus className="w-4 h-4 mr-2" />
              Create Prescription
            </Button>
          </div>
        </Card>

        {/* Loading */}
        {loading && prescriptions.length === 0 && (
          <Loading size="lg" text="Loading prescriptions..." />
        )}

        {/* Error */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchPrescriptions(currentPage, searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading prescriptions"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && prescriptions.length === 0 && (
          <EmptyState
            title="No prescriptions found"
            message={
              searchQuery
                ? 'No prescriptions match your search. Try adjusting your query.'
                : 'Get started by creating your first prescription record.'
            }
            actionLabel={!searchQuery ? 'Create Prescription' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Table */}
        {!loading && !error && prescriptions.length > 0 && (
          <Card variant="elevated">
            <Table
              data={prescriptions}
              columns={columns}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </Card>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={selectedPrescription ? 'Edit Prescription' : 'Create New Prescription'}
          size="lg"
        >
          <PrescriptionForm
            prescription={selectedPrescription}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Prescription"
          message="Are you sure you want to delete this prescription? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          loading={isDeleting}
        />

        {/* Toast */}
        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={5000} />
        )}
      </div>
    </Layout>
  );
}
