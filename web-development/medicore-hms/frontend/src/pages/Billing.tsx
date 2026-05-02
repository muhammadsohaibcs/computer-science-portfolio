/**
 * Billing Page Component
 * Manages billing records with CRUD operations and invoice generation
 */

import { Download, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createBill,
    deleteBill,
    getBills,
    updateBill,
} from '../api/bills.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import BillForm from '../components/modules/BillForm';
import { ApiError } from '../types/api.types';
import { Bill, BillFormData } from '../types/bill.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Billing Page Component
 */
export default function Billing(): JSX.Element {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [billToView, setBillToView] = useState<Bill | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches bills from the API
   */
  const fetchBills = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBills({
        page,
        limit: 10,
        search: search || undefined,
      });

      setBills(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load bills');
      console.error('Bills fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBills(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Handles page change
   */
  const handlePageChange = (page: number) => {
    fetchBills(page, searchQuery);
  };

  /**
   * Opens modal for creating a new bill
   */
  const handleCreateClick = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing a bill
   */
  const handleEditClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (bill: Bill) => {
    setBillToDelete(bill);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Opens view modal to show bill details
   */
  const handleViewClick = (bill: Bill) => {
    setBillToView(bill);
    setIsViewModalOpen(true);
  };

  /**
   * Handles form submission for create/update
   */
  const handleFormSubmit = async (data: BillFormData) => {
    try {
      if (selectedBill) {
        // Update existing bill
        await updateBill(selectedBill._id, data);
        showToast('Bill updated successfully', 'success');
      } else {
        // Create new bill
        await createBill(data);
        showToast('Bill created successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedBill(null);
      fetchBills(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to save bill', 'error');
      throw err; // Re-throw to let form handle it
    }
  };

  /**
   * Handles bill deletion
   */
  const handleDeleteConfirm = async () => {
    if (!billToDelete) return;

    try {
      setIsDeleting(true);
      await deleteBill(billToDelete._id);
      showToast('Bill deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setBillToDelete(null);
      fetchBills(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete bill', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Generates and downloads invoice as text file
   */
  const handleDownloadInvoice = (bill: Bill) => {
    try {
      const invoiceContent = generateInvoiceContent(bill);
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${bill._id}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Invoice downloaded successfully', 'success');
    } catch (err) {
      showToast('Failed to download invoice', 'error');
      console.error('Invoice download error:', err);
    }
  };

  /**
   * Generates invoice content as formatted text
   */
  const generateInvoiceContent = (bill: Bill): string => {
    const date = new Date(bill.createdAt).toLocaleDateString();
    const time = new Date(bill.createdAt).toLocaleTimeString();

    let content = `
========================================
           HOSPITAL INVOICE
========================================

Invoice ID: ${bill._id}
Date: ${date} ${time}
Patient ID: ${bill.patient}
Payment Status: ${bill.paid ? 'PAID' : 'UNPAID'}

========================================
           SERVICE ITEMS
========================================

`;

    bill.items.forEach((item, index) => {
      content += `${index + 1}. ${item.description || item.service || 'Service'}\n`;
      content += `   Quantity: ${item.quantity}\n`;
      content += `   Unit Price: $${item.unitPrice.toFixed(2)}\n`;
      content += `   Total: $${item.totalPrice.toFixed(2)}\n\n`;
    });

    content += `========================================
           SUMMARY
========================================

Subtotal:        $${bill.subtotal.toFixed(2)}
Taxes:           $${bill.taxes.toFixed(2)}
----------------------------------------
TOTAL:           $${bill.total.toFixed(2)}
========================================

`;

    if (bill.payments && bill.payments.length > 0) {
      content += `\nPayment History:\n`;
      bill.payments.forEach((payment, index) => {
        const paymentDate = new Date(payment.timestamp).toLocaleString();
        content += `${index + 1}. ${payment.method} - $${payment.amount.toFixed(2)} on ${paymentDate}\n`;
      });
    }

    content += `\nThank you for your business!\n`;

    return content;
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
    setSelectedBill(null);
  };

  /**
   * Closes the view modal
   */
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setBillToView(null);
  };

  /**
   * Closes the delete dialog
   */
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setBillToDelete(null);
  };


  // Define table columns
  const columns: Column<Bill>[] = [
    {
      key: '_id',
      label: 'Invoice ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value.substring(0, 8)}...</span>
      ),
    },
    {
      key: 'patient',
      label: 'Patient ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value.substring(0, 8)}...</span>
      ),
    },
    {
      key: 'items',
      label: 'Services',
      render: (value: Bill['items']) => (
        <div className="text-sm">
          {value.length} item{value.length !== 1 ? 's' : ''}
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total Amount',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          ${value.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'paid',
      label: 'Payment Status',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}
        >
          {value ? 'Paid' : 'Unpaid'}
        </span>
      ),
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage billing records and generate invoices
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
                placeholder="Search bills by patient ID or invoice ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search bills"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateClick}
              variant="primary"
              size="md"
              ariaLabel="Create new bill"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && bills.length === 0 && <Loading size="lg" text="Loading bills..." />}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchBills(currentPage, searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading bills"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && bills.length === 0 && (
          <EmptyState
            title="No bills found"
            message={
              searchQuery
                ? 'No bills match your search criteria. Try adjusting your search.'
                : 'Get started by creating your first billing record.'
            }
            actionLabel={!searchQuery ? 'Create Bill' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Bills Table */}
        {!loading && !error && bills.length > 0 && (
          <Card variant="elevated">
            <Table
              data={bills}
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
          title={selectedBill ? 'Edit Bill' : 'Create New Bill'}
          size="xl"
        >
          <BillForm
            bill={selectedBill}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* View Bill Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          title="Bill Details"
          size="lg"
        >
          {billToView && (
            <div className="space-y-6">
              {/* Bill Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice ID</p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {billToView._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patient ID</p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {billToView.patient}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(billToView.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        billToView.paid
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {billToView.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Items */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Service Items
                </h4>
                <div className="space-y-3">
                  {billToView.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.description || item.service || 'Service'}
                          </p>
                          {item.service && item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              ID: {item.service}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Qty: {item.quantity}</span>
                        <span>Unit Price: ${item.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${billToView.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taxes:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${billToView.taxes.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ${billToView.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {billToView.payments && billToView.payments.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Payment History
                  </h4>
                  <div className="space-y-2">
                    {billToView.payments.map((payment, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.method}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(payment.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${payment.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleDownloadInvoice(billToView)}
                  ariaLabel="Download invoice"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
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
          title="Delete Bill"
          message={`Are you sure you want to delete this bill? This action cannot be undone.`}
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
