/**
 * Inventory Page Component
 * Manages inventory items with CRUD operations and low stock highlighting
 */

import { AlertTriangle, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createInventoryItem,
    deleteInventoryItem,
    getInventoryItems,
    updateInventoryItem,
} from '../api/inventory.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import InventoryForm from '../components/modules/InventoryForm';
import { ApiError } from '../types/api.types';
import { InventoryFormData, InventoryItem } from '../types/inventory.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Inventory Page Component
 */
export default function Inventory(): JSX.Element {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [itemToView, setItemToView] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches inventory items from the API
   */
  const fetchItems = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getInventoryItems({
        page,
        limit: 10,
        search: search || undefined,
      });

      setItems(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load inventory items');
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Handles page change
   */
  const handlePageChange = (page: number) => {
    fetchItems(page, searchQuery);
  };

  /**
   * Opens modal for creating a new item
   */
  const handleCreateClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing an item
   */
  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Opens view modal to show item details
   */
  const handleViewClick = (item: InventoryItem) => {
    setItemToView(item);
    setIsViewModalOpen(true);
  };

  /**
   * Handles form submission for create/update
   */
  const handleFormSubmit = async (data: InventoryFormData) => {
    try {
      if (selectedItem) {
        // Update existing item
        await updateInventoryItem(selectedItem._id, data);
        showToast('Inventory item updated successfully', 'success');
      } else {
        // Create new item
        await createInventoryItem(data);
        showToast('Inventory item created successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedItem(null);
      fetchItems(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      
      // Handle lock conflict error
      if (apiError.lockInfo) {
        const expiresAt = new Date(apiError.lockInfo.expiresAt);
        const now = new Date();
        const secondsRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
        
        // If lock has already expired, show a different message
        if (secondsRemaining === 0) {
          showToast(
            'This item was locked but the lock has expired. Please try again.',
            'warning'
          );
        } else {
          showToast(
            `This item is currently being edited by another user. Please try again in ${secondsRemaining} seconds.`,
            'warning'
          );
        }
      } else {
        showToast(apiError.message || 'Failed to save inventory item', 'error');
      }
      
      throw err; // Re-throw to let form handle it
    }
  };

  /**
   * Handles item deletion
   */
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deleteInventoryItem(itemToDelete._id);
      showToast('Inventory item deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchItems(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete inventory item', 'error');
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
    setSelectedItem(null);
  };

  /**
   * Closes the view modal
   */
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setItemToView(null);
  };

  /**
   * Closes the delete dialog
   */
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  /**
   * Checks if an item has low stock
   */
  const isLowStock = (item: InventoryItem): boolean => {
    return item.quantity <= item.reorderThreshold;
  };

  // Define table columns
  const columns: Column<InventoryItem>[] = [
    {
      key: 'itemCode',
      label: 'Item Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: 'name',
      label: 'Item Name',
      sortable: true,
      render: (value: string, item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
          {isLowStock(item) && (
            <span title="Low stock" className="inline-flex">
              <AlertTriangle className="w-4 h-4 text-red-500" aria-label="Low stock" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value: string | undefined) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Stock Level',
      sortable: true,
      render: (value: number, item: InventoryItem) => (
        <div className="flex flex-col">
          <span
            className={`font-semibold ${
              isLowStock(item)
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {value} {item.unit}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Min: {item.reorderThreshold} {item.unit}
          </span>
        </div>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (value: string | undefined) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {value && typeof value === 'string' ? value.substring(0, 8) + '...' : 'N/A'}
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

  // Count low stock items
  const lowStockCount = items.filter(isLowStock).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage hospital inventory and track stock levels
          </p>
        </div>

        {/* Low Stock Alert */}
        {!loading && lowStockCount > 0 && (
          <Card variant="elevated" className="mb-6 border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Low Stock Alert
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} need{lowStockCount === 1 ? 's' : ''} reordering
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Actions */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item code, name, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search inventory items"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateClick}
              variant="primary"
              size="md"
              ariaLabel="Add new inventory item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && items.length === 0 && <Loading size="lg" text="Loading inventory..." />}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchItems(currentPage, searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading inventory"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            title="No inventory items found"
            message={
              searchQuery
                ? 'No items match your search criteria. Try adjusting your search.'
                : 'Get started by adding your first inventory item.'
            }
            actionLabel={!searchQuery ? 'Add Item' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Inventory Table */}
        {!loading && !error && items.length > 0 && (
          <Card variant="elevated">
            <Table
              data={items}
              columns={columns}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onView={handleViewClick}
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
          title={selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          size="lg"
        >
          <InventoryForm
            item={selectedItem}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* View Item Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          title="Inventory Item Details"
          size="md"
        >
          {itemToView && (
            <div className="space-y-6">
              {/* Item Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {itemToView.name}
                  </h3>
                  {isLowStock(itemToView) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low Stock
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  Code: {itemToView.itemCode}
                </p>
              </div>

              {/* Item Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {itemToView.category || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unit</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {itemToView.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Stock</p>
                  <p
                    className={`text-lg font-bold ${
                      isLowStock(itemToView)
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {itemToView.quantity} {itemToView.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minimum Stock Level</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {itemToView.reorderThreshold} {itemToView.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Supplier ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {itemToView.supplier || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(itemToView.updatedAt).toLocaleString()}
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
          title="Delete Inventory Item"
          message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
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
