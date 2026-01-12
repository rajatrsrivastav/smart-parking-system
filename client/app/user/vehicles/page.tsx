'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';

interface Vehicle {
  id: string;
  user_id: string;
  vehicle_name: string;
  plate_number: string;
  vehicle_type: string;
  created_at: string;
  updated_at: string;
  qr_code: string | null;
}

interface FormData {
  vehicle_name: string;
  plate_number: string;
  vehicle_type: string;
}

export default function VehiclesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<FormData>({
    vehicle_name: '',
    plate_number: '',
    vehicle_type: 'sedan'
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: vehicles = [], isLoading: loading, error } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'vehicles'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch vehicles');
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) throw new Error('Failed to create vehicle');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'vehicles'] });
      setShowAddModal(false);
      setFormData({ vehicle_name: '', plate_number: '', vehicle_type: 'sedan' });
      setFormError(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'vehicles'] });
      setShowEditModal(false);
      setSelectedVehicle(null);
      setFormData({ vehicle_name: '', plate_number: '', vehicle_type: 'sedan' });
      setFormError(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'vehicles'] });
      setShowDeleteConfirm(false);
      setSelectedVehicle(null);
    },
  });

  const handleAddVehicle = () => {
    if (!formData.vehicle_name.trim() || !formData.plate_number.trim()) {
      setFormError('Vehicle name and plate number are required');
      return;
    }
    setFormError(null);
    createVehicleMutation.mutate(formData);
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle) return;
    if (!formData.vehicle_name.trim() || !formData.plate_number.trim()) {
      setFormError('Vehicle name and plate number are required');
      return;
    }
    setFormError(null);
    updateVehicleMutation.mutate({ id: selectedVehicle.id, data: formData });
  };

  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;
    setFormError(null);
    deleteVehicleMutation.mutate(selectedVehicle.id);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicle_name: vehicle.vehicle_name,
      plate_number: vehicle.plate_number,
      vehicle_type: vehicle.vehicle_type
    });
    setFormError(null);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormError(null);
    setShowDeleteConfirm(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ vehicle_name: '', plate_number: '', vehicle_type: 'sedan' });
    setFormError(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <div className="bg-[#6366f1] text-white px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-medium">Manage Vehicles</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 pb-24">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
              <p className="text-gray-500 mt-4">Loading vehicles...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-sm">{error.message}</p>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'vehicles'] })}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Try again →
              </button>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
                />
              </svg>
              <p className="text-gray-700 font-medium mb-1">No Vehicles Yet</p>
              <p className="text-sm text-gray-500">Add your first vehicle to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle: Vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-[#eef2ff] rounded-lg p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{vehicle.vehicle_name}</h3>
                      <p className="text-sm text-gray-600">{vehicle.plate_number}</p>
                      <p className="text-xs text-gray-500 mt-1">{vehicle.vehicle_type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(vehicle)}
                      className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full mt-6 py-3 bg-[#6366f1] hover:bg-[#5855eb] text-white rounded-xl font-medium transition-colors"
          >
            Add New Vehicle
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Add New Vehicle</h2>
              <button
                onClick={closeAddModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                  placeholder="e.g., Toyota Camry"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                  disabled={createVehicleMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                <input
                  type="text"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  placeholder="e.g., MH 12 AB 1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                  disabled={createVehicleMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                  disabled={createVehicleMutation.isPending}
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="coupe">Coupe</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeAddModal}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                disabled={createVehicleMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                className="flex-1 py-3 bg-[#6366f1] hover:bg-[#5855eb] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                disabled={createVehicleMutation.isPending}
              >
                {createVehicleMutation.isPending ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Edit Vehicle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVehicle(null);
                  setFormError(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                  placeholder="e.g., Toyota Camry"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                  disabled={updateVehicleMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                <input
                  type="text"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  placeholder="e.g., MH 12 AB 1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                  disabled={updateVehicleMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                  disabled={updateVehicleMutation.isPending}
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="coupe">Coupe</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVehicle(null);
                  setFormError(null);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                disabled={updateVehicleMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleEditVehicle}
                className="flex-1 py-3 bg-[#6366f1] hover:bg-[#5855eb] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                disabled={updateVehicleMutation.isPending}
              >
                {updateVehicleMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 0v2m0-6H9m6 0h-3m6 0h3m-9-9a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Remove Vehicle?</h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              Are you sure you want to remove <span className="font-medium">{selectedVehicle.vehicle_name}</span>?
              This action cannot be undone.
            </p>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedVehicle(null);
                  setFormError(null);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                disabled={deleteVehicleMutation.isPending}
              >
                Keep
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                disabled={deleteVehicleMutation.isPending}
              >
                {deleteVehicleMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav role="user" />
    </div>
  );
}
