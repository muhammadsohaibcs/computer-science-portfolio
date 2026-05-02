/**
 * Departments Page Component
 * Manages departments with CRUD operations and staff linking
 */

import { Building2, Plus, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createDepartment,
    deleteDepartment,
    getDepartments,
    updateDepartment,
} from '../api/departments.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import DepartmentForm from '../components/modules/DepartmentForm';
import { ApiError } from '../types/api.types';
import { Department, DepartmentFormData } from '../types/department.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Departments Page Component
 */
export default function Departments(): JSX.Element {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [departmentToView, setDepartmentToView] = useState<Department | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches departments from the API
   */
  const fetchDepartments = async (search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDepartments({
        q: search || undefined,
        limit: 100,
      });

      setDepartments(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load departments');
      console.error('Departments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDepartments(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Opens modal for creating a new department
   */
  const handleCreateClick = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing a department
   */
  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Opens view modal to show department details
   */
  const handleViewClick = (department: Department) => {
    setDepartmentToView(department);
    setIsViewModalOpen(true);
  };

  /**
   * Handles form submission for create/update
   */
  const handleFormSubmit = async (data: DepartmentFormData) => {
    try {
      if (selectedDepartment) {
        // Update existing department
        await updateDepartment(selectedDepartment._id, data);
        showToast('Department updated successfully', 'success');
      } else {
        // Create new department
        await createDepartment(data);
        showToast('Department created successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedDepartment(null);
      fetchDepartments(searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to save department', 'error');
      throw err; // Re-throw to let form handle it
    }
  };

  /**
   * Handles department deletion
   */
  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      setIsDeleting(true);
      await deleteDepartment(departmentToDelete._id);
      showToast('Department deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      fetchDepartments(searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete department', 'error');
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
    setSelectedDepartment(null);
  };

  /**
   * Closes the view modal
   */
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setDepartmentToView(null);
  };

  /**
   * Closes the delete dialog
   */
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDepartmentToDelete(null);
  };


  // Define table columns
  const columns: Column<Department>[] = [
    {
      key: 'name',
      label: 'Department Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      render: (value: string | undefined) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'head',
      label: 'Department Head',
      render: (value: string | undefined) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {value ? 'Assigned' : 'Not assigned'}
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string | undefined) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {value || 'No description'}
        </span>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage hospital departments and their staff
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
                placeholder="Search departments by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search departments"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateClick}
              variant="primary"
              size="md"
              ariaLabel="Add new department"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && departments.length === 0 && <Loading size="lg" text="Loading departments..." />}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchDepartments(searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading departments"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && departments.length === 0 && (
          <EmptyState
            title="No departments found"
            message={
              searchQuery
                ? 'No departments match your search criteria. Try adjusting your search.'
                : 'Get started by adding your first department.'
            }
            actionLabel={!searchQuery ? 'Add Department' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Departments Table */}
        {!loading && !error && departments.length > 0 && (
          <Card variant="elevated">
            <Table
              data={departments}
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
          title={selectedDepartment ? 'Edit Department' : 'Add New Department'}
          size="lg"
        >
          <DepartmentForm
            department={selectedDepartment}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* View Department Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          title="Department Details"
          size="md"
        >
          {departmentToView && (
            <div className="space-y-6">
              {/* Department Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {departmentToView.name}
                    </h3>
                    {departmentToView.code && (
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        Code: {departmentToView.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Department Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {departmentToView.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Department Head</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-white">
                      {departmentToView.head ? 'Assigned' : 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(departmentToView.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(departmentToView.updatedAt).toLocaleString()}
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
          title="Delete Department"
          message={`Are you sure you want to delete "${departmentToDelete?.name}"? This action cannot be undone.`}
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
