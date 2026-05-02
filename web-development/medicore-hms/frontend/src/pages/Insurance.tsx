/**
 * Insurance Page Component
 * Manages insurance records with CRUD operations
 */

import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createInsurance,
    deleteInsurance,
    getInsurances,
    updateInsurance,
} from '../api/insurance.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import InsuranceForm from '../components/modules/InsuranceForm';
import { ApiError } from '../types/api.types';
import { Insurance, InsuranceFormData } from '../types/insurance.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Insurance Page Component
 */
export default function InsurancePage(): JSX.Element {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [insuranceToDelete, setInsuranceToDelete] = useState<Insurance | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches insurance records from the API
   */
  const fetchInsurances = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getInsurances({
        page,
        limit: 10,
        search: search || undefined,
      });

      setInsurances(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load insurance records');
      console.error('Insurance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInsurances(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Handles page change
   */
  const handlePageChange = (page: number) => {
    fetchInsurances(page, searchQuery);
  };

  /**
   * Opens modal for creating a new insurance record
   */
  const handleCreateClick = () => {
    setSelectedInsurance(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing an insurance record
   */
  const handleEditClick = (insurance: Insurance) => {
    setSelectedInsurance(insurance);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (insurance: Insurance) => {
    setInsuranceToDelete(insurance);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handles form submission for create/update
   */
  const handleFormSubmit = async (data: InsuranceFormData) => {
    try {
      if (selectedInsurance) {
        // Update existing insurance
        await updateInsurance(selectedInsurance._id, data);
        showToast('Insurance record updated successfully', 'success');
      } else {
        // Create new insurance
        await createInsurance(data);
        showToast('Insurance record created successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedInsurance(null);
      fetchInsurances(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to save insurance record', 'error');
      throw err; // Re-throw to let form handle it
    }
  };

  /**
   * Handles insurance deletion
   */
  const handleDeleteConfirm = async () => {
    if (!insuranceToDelete) return;

    try {
      setIsDeleting(true);
      await deleteInsurance(insuranceToDelete._id);
      showToast('Insurance record deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setInsuranceToDelete(null);
      fetchInsurances(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete insurance record', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Shows a toast notification
   */
  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ show: true, message, type });
  };

  /**
   * Closes the toast notification
   */
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  /**
   * Closes the modal
   */
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInsurance(null);
  };

  /**
   * Closes the delete dialog
   */
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setInsuranceToDelete(null);
  };

  // Fetch insurance records on component mount

  // Define table columns
  const columns: Column<Insurance>[] = [
    {
      key: 'providerName',
      label: 'Provider Name',
      sortable: true,
    },
    {
      key: 'policyNumber',
      label: 'Policy Number',
      sortable: true,
    },
    {
      key: 'patient',
      label: 'Patient ID',
      sortable: true,
    },
    {
      key: 'validFrom',
      label: 'Valid From',
      sortable: true,
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'validTo',
      label: 'Valid To',
      sortable: true,
      render: (value?: string) => {
        if (!value) return '-';
        const date = new Date(value);
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? 'text-red-600 dark:text-red-400' : ''}>
            {date.toLocaleDateString()}
            {isExpired && ' (Expired)'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insurance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage insurance providers and patient coverage information
          </p>
        </div>

        {/* Search and Actions */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by provider, policy number, or patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search insurance records"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateClick}
              variant="primary"
              size="md"
              ariaLabel="Create new insurance record"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Insurance
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && insurances.length === 0 && (
          <Loading size="lg" text="Loading insurance records..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchInsurances(currentPage, searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading insurance records"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && insurances.length === 0 && (
          <EmptyState
            title="No insurance records found"
            message={
              searchQuery
                ? 'No insurance records match your search criteria. Try adjusting your search.'
                : 'Get started by adding your first insurance record.'
            }
            actionLabel={!searchQuery ? 'Add Insurance' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Insurance Table */}
        {!loading && !error && insurances.length > 0 && (
          <Card variant="elevated">
            <Table
              data={insurances}
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
          title={selectedInsurance ? 'Edit Insurance Record' : 'Add New Insurance Record'}
          size="lg"
        >
          <InsuranceForm
            insurance={selectedInsurance}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Insurance Record"
          message={`Are you sure you want to delete this insurance record for policy ${insuranceToDelete?.policyNumber}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          loading={isDeleting}
        />

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
            duration={5000}
          />
        )}
      </div>
    </Layout>
  );
}
