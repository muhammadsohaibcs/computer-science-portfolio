/**
 * Suppliers Page Component
 * Manages suppliers with CRUD operations and inventory linking
 */

import { Package, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createSupplier,
    deleteSupplier,
    getSuppliers,
    updateSupplier,
} from '../api/suppliers.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import SupplierForm from '../components/modules/SupplierForm';
import { ApiError } from '../types/api.types';
import { Supplier, SupplierFormData } from '../types/supplier.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Suppliers Page Component
 */
export default function Suppliers(): JSX.Element {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [supplierToView, setSupplierToView] = useState<Supplier | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches suppliers from the API
   */
  const fetchSuppliers = async (search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuppliers({
        q: search || undefined,
        limit: 100,
      });

      setSuppliers(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load suppliers');
      console.error('Suppliers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuppliers(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Opens modal for creating a new supplier
   */
  const handleCreateClick = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing a supplier
   */
  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Opens view modal to show supplier details
   */
  const handleViewClick = (supplier: Supplier) => {
    setSupplierToView(supplier);
    setIsViewModalOpen(true);
  };

  /**
   * Handles form submission for create/update
   */
  const handleFormSubmit = async (data: SupplierFormData) => {
    try {
      if (selectedSupplier) {
        // Update existing supplier
        await updateSupplier(selectedSupplier._id, data);
        showToast('Supplier updated successfully', 'success');
      } else {
        // Create new supplier
        await createSupplier(data);
        showToast('Supplier created successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedSupplier(null);
      fetchSuppliers(searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to save supplier', 'error');
      throw err; // Re-throw to let form handle it
    }
  };

  /**
   * Handles supplier deletion
   */
  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;

    try {
      setIsDeleting(true);
      await deleteSupplier(supplierToDelete._id);
      showToast('Supplier deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
      fetchSuppliers(searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete supplier', 'error');
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
    setSelectedSupplier(null);
  };

  /**
   * Closes the view modal
   */
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSupplierToView(null);
  };

  /**
   * Closes the delete dialog
   */
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };


  // Define table columns
  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      label: 'Supplier Name',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'contact.email' as keyof Supplier,
      label: 'Email',
      render: (_value: unknown, item: Supplier) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.contact?.email || 'N/A'}
        </span>
      ),
    },
    {
      key: 'contact.phone' as keyof Supplier,
      label: 'Phone',
      render: (_value: unknown, item: Supplier) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.contact?.phone || 'N/A'}
        </span>
      ),
    },
    {
      key: 'suppliedItems',
      label: 'Inventory Items',
      render: (value: string[] | undefined) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {value?.length || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage suppliers and their contact information
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
                placeholder="Search suppliers by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search suppliers"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateClick}
              variant="primary"
              size="md"
              ariaLabel="Add new supplier"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && suppliers.length === 0 && <Loading size="lg" text="Loading suppliers..." />}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchSuppliers(searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading suppliers"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && suppliers.length === 0 && (
          <EmptyState
            title="No suppliers found"
            message={
              searchQuery
                ? 'No suppliers match your search criteria. Try adjusting your search.'
                : 'Get started by adding your first supplier.'
            }
            actionLabel={!searchQuery ? 'Add Supplier' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Suppliers Table */}
        {!loading && !error && suppliers.length > 0 && (
          <Card variant="elevated">
            <Table
              data={suppliers}
              columns={columns}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onView={handleViewClick}
            />
          </Card>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          size="lg"
        >
          <SupplierForm
            supplier={selectedSupplier}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* View Supplier Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          title="Supplier Details"
          size="md"
        >
          {supplierToView && (
            <div className="space-y-6">
              {/* Supplier Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {supplierToView.name}
                </h3>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {supplierToView.contact?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {supplierToView.contact?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {supplierToView.contact?.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inventory Items */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Supplied Inventory Items
                </h4>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {supplierToView.suppliedItems?.length || 0} items
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(supplierToView.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(supplierToView.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleViewModalClose}
                  ariaLabel="Close"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Supplier"
          message={`Are you sure you want to delete "${supplierToDelete?.name}"? This action cannot be undone.`}
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
