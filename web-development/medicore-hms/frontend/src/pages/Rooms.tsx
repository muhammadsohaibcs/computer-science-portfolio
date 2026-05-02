/**
 * Rooms Page Component
 * Manages hospital rooms with CRUD operations and occupancy tracking
 */

import { Bed, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    createRoom,
    deleteRoom,
    getRooms,
    updateRoom,
} from '../api/rooms.api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Table, { Column } from '../components/common/Table';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import RoomForm from '../components/modules/RoomForm';
import { ApiError } from '../types/api.types';
import { Room, RoomFormData, RoomStatus, RoomType } from '../types/room.types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Rooms Page Component
 */
export default function Rooms(): JSX.Element {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [roomToView, setRoomToView] = useState<Room | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  /**
   * Fetches rooms from the API
   */
  const fetchRooms = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await getRooms({
        page,
        limit: 10,
        search: search || undefined,
      });

      setRooms(response.data);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load rooms');
      console.error('Rooms fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRooms(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Handles page change
   */
  const handlePageChange = (page: number) => {
    fetchRooms(page, searchQuery);
  };

  /**
   * Opens modal for creating a new room
   */
  const handleCreateClick = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing a room
   */
  const handleEditClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  /**
   * Opens delete confirmation dialog
   */
  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Opens view modal to show room details
   */
  const handleViewClick = (room: Room) => {
    setRoomToView(room);
    setIsViewModalOpen(true);
  };

  /**
   * Handles form submission for create/update
   */
  const handleFormSubmit = async (data: RoomFormData) => {
    try {
      if (selectedRoom) {
        // Update existing room
        await updateRoom(selectedRoom._id, data);
        showToast('Room updated successfully', 'success');
      } else {
        // Create new room
        await createRoom(data);
        showToast('Room created successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedRoom(null);
      fetchRooms(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to save room', 'error');
      throw err; // Re-throw to let form handle it
    }
  };

  /**
   * Handles room deletion
   */
  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    try {
      setIsDeleting(true);
      await deleteRoom(roomToDelete._id);
      showToast('Room deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
      fetchRooms(currentPage, searchQuery);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete room', 'error');
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
    setSelectedRoom(null);
  };

  /**
   * Closes the view modal
   */
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setRoomToView(null);
  };

  /**
   * Closes the delete dialog
   */
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  /**
   * Gets status badge color
   */
  const getStatusColor = (status: RoomStatus): string => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Occupied':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  /**
   * Gets room type badge color
   */
  const getTypeColor = (type: RoomType): string => {
    switch (type) {
      case 'ICU':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Private':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Semi-Private':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Ward':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };


  // Define table columns
  const columns: Column<Room>[] = [
    {
      key: 'roomNumber',
      label: 'Room Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: RoomType) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: RoomStatus) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'floor',
      label: 'Floor',
      sortable: true,
      render: (value: number | undefined) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value !== undefined ? `Floor ${value}` : 'N/A'}
        </span>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (value: number | undefined, room: Room) => (
        <div className="flex items-center gap-2">
          <Bed className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {room.currentOccupancy || 0} / {value || 1}
          </span>
        </div>
      ),
    },
    {
      key: 'assignedPatientName',
      label: 'Current Patient',
      render: (value: string | undefined) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || 'None'}
        </span>
      ),
    },
  ];

  // Calculate statistics
  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rooms</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage hospital rooms and track occupancy
          </p>
        </div>

        {/* Statistics Cards */}
        {!loading && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card variant="elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {availableRooms}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Bed className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Occupied</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {occupiedRooms}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Bed className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {maintenanceRooms}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Bed className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Actions */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms by room number or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search rooms"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateClick}
              variant="primary"
              size="md"
              ariaLabel="Add new room"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && rooms.length === 0 && <Loading size="lg" text="Loading rooms..." />}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => fetchRooms(currentPage, searchQuery)}
                variant="danger"
                size="sm"
                ariaLabel="Retry loading rooms"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && rooms.length === 0 && (
          <EmptyState
            title="No rooms found"
            message={
              searchQuery
                ? 'No rooms match your search criteria. Try adjusting your search.'
                : 'Get started by adding your first room.'
            }
            actionLabel={!searchQuery ? 'Add Room' : undefined}
            onAction={!searchQuery ? handleCreateClick : undefined}
          />
        )}

        {/* Rooms Table */}
        {!loading && !error && rooms.length > 0 && (
          <Card variant="elevated">
            <Table
              data={rooms}
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
          title={selectedRoom ? 'Edit Room' : 'Add New Room'}
          size="lg"
        >
          <RoomForm
            room={selectedRoom}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>

        {/* View Room Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          title="Room Details"
          size="md"
        >
          {roomToView && (
            <div className="space-y-6">
              {/* Room Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Room {roomToView.roomNumber}
                  </h3>
                  <div className="flex gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        roomToView.type
                      )}`}
                    >
                      {roomToView.type}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        roomToView.status
                      )}`}
                    >
                      {roomToView.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Floor</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {roomToView.floor !== undefined ? `Floor ${roomToView.floor}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {roomToView.capacity || 1} bed{(roomToView.capacity || 1) > 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Occupancy</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {roomToView.currentOccupancy || 0} / {roomToView.capacity || 1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Patient</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {roomToView.assignedPatientName || 'None'}
                  </p>
                </div>
              </div>

              {/* Features */}
              {roomToView.features && roomToView.features.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {roomToView.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(roomToView.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(roomToView.updatedAt).toLocaleString()}
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
          title="Delete Room"
          message={`Are you sure you want to delete room "${roomToDelete?.roomNumber}"? This action cannot be undone.`}
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
