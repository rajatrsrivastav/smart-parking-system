'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<FormData>({
    vehicle_name: '',
    plate_number: '',
    vehicle_type: 'sedan'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`);
      const result = await response.json();
      if (result.success && result.data) {
        setVehicles(result.data);
      } else {
        throw new Error(result.error || 'Failed to load vehicles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!formData.vehicle_name.trim() || !formData.plate_number.trim()) {
      setFormError('Vehicle name and plate number are required');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: DEMO_USER_ID
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setVehicles([...vehicles, result.data]);
        setShowAddModal(false);
        setFormData({ vehicle_name: '', plate_number: '', vehicle_type: 'sedan' });
        setFormError(null);
      } else {
        throw new Error(result.error || 'Failed to add vehicle');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle) return;
    if (!formData.vehicle_name.trim() || !formData.plate_number.trim()) {
      setFormError('Vehicle name and plate number are required');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success && result.data) {
        setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? result.data : v));
        setShowEditModal(false);
        setSelectedVehicle(null);
        setFormData({ vehicle_name: '', plate_number: '', vehicle_type: 'sedan' });
        setFormError(null);
      } else {
        throw new Error(result.error || 'Failed to update vehicle');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${selectedVehicle.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        setVehicles(vehicles.filter(v => v.id !== selectedVehicle.id));
        setShowDeleteConfirm(false);
        setSelectedVehicle(null);
        setFormError(null);
      } else {
        throw new Error(result.error || 'Failed to delete vehicle');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete vehicle');
    } finally {
      setSubmitting(false);
    }
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
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-6 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Manage Vehicles</h1>
          </div>
          <p className="text-indigo-100 text-sm">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        <div className="px-6 py-6 pb-32">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-gray-500 mt-4">Loading vehicles...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={loadVehicles}
                className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Try again →
              </button>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
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
              <p className="text-gray-700 font-semibold mb-1">No Vehicles Yet</p>
              <p className="text-sm text-gray-500">Add your first vehicle to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-lg p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{vehicle.vehicle_name}</h3>
                      <p className="text-sm text-gray-600">{vehicle.plate_number}</p>
                      <p className="text-xs text-gray-500 mt-1">John Doe</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(vehicle)}
                      className="py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Vehicle
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Vehicle</h2>
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                  placeholder="e.g., Toyota Camry"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate</label>
                <input
                  type="text"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  placeholder="e.g., MH 12 AB 1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={submitting}
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
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedVehicle && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                  placeholder="e.g., Toyota Camry"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate</label>
                <input
                  type="text"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  placeholder="e.g., MH 12 AB 1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={submitting}
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
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleEditVehicle}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedVehicle && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
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

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Remove Vehicle?</h3>
            <p className="text-gray-600 text-center mb-4">
              Are you sure you want to remove <span className="font-semibold">{selectedVehicle.vehicle_name}</span>?
              This action cannot be undone.
            </p>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
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
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                disabled={submitting}
              >
                Keep
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav role="user" />
    </div>
  );
}
