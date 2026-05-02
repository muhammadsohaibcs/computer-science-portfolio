/**
 * Services Page Component
 * Manages hospital service records with CRUD operations
 */

import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createService, deleteService, getServices, updateService } from '../api/services.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import ServiceForm from '../components/modules/ServiceForm';
import { ApiError } from '../types/api.types';
import { Service, ServiceFormData } from '../types/service.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Services Page Component
 */
export default function Services(): JSX.Element {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches services from the API
   */
  const fetchServices = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getServices({
        page,
        limit: 10,
        search: search || undefined,
      });

      setServices(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load services');
      console.error('Services fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchServices(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Handles page change
   */
  const handlePageChange = (page: number) => {
    fetchServices(page, searchQuery);
  };

  /**
   * Opens modal for creating a new service
   */
  const handleCreateClick = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing a service
   */
  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handles form submission for create/update
   */
  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      if (selectedService) {
        // Update existing service
        await updateService(selectedService._id, data);
        showToast('Service updated successfully', 'success');
      } else {
        // Create new service
        await createService(data);
        showToast('Service created successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedService(null);
      fetchServices(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to save service', 'error');
      throw err; // Re-throw to let form handle it
    }
  };

  /**
   * Handles service deletion
   */
  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      setIsDeleting(true);
      await deleteService(serviceToDelete._id);
      showToast('Service deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
      fetchServices(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete service', 'error');
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
    setSelectedService(null);
  };

  /**
   * Closes the delete dialog
   */
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
  };


  // Define table columns
  const columns: Column<Service>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Service Name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string | undefined) => value || '-',
    },
    {
      key: 'basePrice',
      label: 'Price',
      sortable: true,
      render: (value: number | undefined) => value !== undefined ? `$${value.toFixed(2)}` : 'N/A',
    },
    {
      key: 'durationMinutes',
      label: 'Duration',
      render: (value: number | undefined) => value !== undefined ? `${value} min` : 'N/A',
    },
    {
      key: 'department',
      label: 'Department',
      render: (value: string | undefined) => value || '-',
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string | undefined) => value || '-',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hospital Services
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage hospital services, treatments, and procedures
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
                placeholder="Search services by name, code, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search services"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateClick}
              variant="primary"
              size="md"
              ariaLabel="Create new service"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && services.length === 0 && (
          <Loading size="lg" text="Loading services..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchServices(currentPage, searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading services"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <EmptyState
            title="No services found"
            message={
              searchQuery
                ? 'No services match your search criteria. Try adjusting your search.'
                : 'Get started by creating your first hospital service.'
            }
            actionLabel={!searchQuery ? 'Create Service' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Services Table */}
        {!loading && !error && services.length > 0 && (
          <Card variant="elevated">
            <Table
              data={services}
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
          title={selectedService ? 'Edit Service' : 'Create New Service'}
          size="lg"
        >
          <ServiceForm
            service={selectedService}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Service"
          message={`Are you sure you want to delete ${serviceToDelete?.name}? This action cannot be undone.`}
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
