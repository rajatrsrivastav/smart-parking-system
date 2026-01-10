'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_available: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  is_available: boolean;
}

export default function ManagerPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [parkingHistory, setParkingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    is_available: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
    loadDrivers();
    loadParkingHistory();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/dashboard`);
      const result = await response.json();
      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
    setLoading(false);
  };

  const loadDrivers = async () => {
    setDriversLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers`);
      const result = await response.json();
      if (result.success && result.data) {
        setDrivers(result.data);
      }
    } catch (error) {
      console.error('Failed to load drivers:', error);
    }
    setDriversLoading(false);
  };

  const loadParkingHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parking-history`);
      const result = await response.json();
      if (result.success && result.data) {
        setParkingHistory(result.data.history || []);
      }
    } catch (error) {
      console.error('Failed to load parking history:', error);
    }
  };

  const handleAddDriver = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Name, email, and phone are required');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDrivers([...drivers, result.data]);
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', is_available: true });
        setFormError(null);
      } else {
        throw new Error(result.error || 'Failed to add driver');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ name: '', email: '', phone: '', is_available: true });
    setFormError(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDuration = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Add Driver
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-1">Manager Dashboard</h1>
          <p className="text-gray-300 text-sm">Manage valet assignments and parking operations</p>
        </div>

        <div className="px-6 py-6 pb-6">
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.activeCars || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Active Cars</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-2xl font-bold text-orange-600">{dashboardData?.retrieving || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Retrieving</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.totalToday || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Total Today</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-2xl font-bold text-green-600">₹{dashboardData?.revenue || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Revenue</div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4">Active Parking Sessions</h2>

          {!dashboardData?.assignments || dashboardData.assignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-700 font-semibold mb-1">No Active Sessions</p>
              <p className="text-sm text-gray-500">Active parking sessions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.assignments.map((assignment: any) => (
                <div key={assignment.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{assignment.vehicles.vehicle_name}</h3>
                      <p className="text-sm text-gray-600">{assignment.vehicles.plate_number}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Parked
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Customer</p>
                      <p className="font-medium text-gray-900">{assignment.users.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Location</p>
                      <p className="font-medium text-gray-900">{assignment.parking_sites.name}</p>
                    </div>
                    {assignment.parking_spot && (
                      <div>
                        <p className="text-gray-500 text-xs">Spot</p>
                        <p className="font-medium text-gray-900">{assignment.parking_spot}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 text-xs">Duration</p>
                      <p className="font-medium text-gray-900">{getDuration(assignment.entry_time)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Entry Time</p>
                      <p className="font-medium text-gray-900">{formatTime(assignment.entry_time)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Payment</p>
                      <p className="font-medium text-gray-900 capitalize">{assignment.payment_status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Driver Management</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Add Driver
            </button>
          </div>

          {driversLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-gray-500 mt-4">Loading drivers...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-700 font-semibold mb-1">No Drivers</p>
              <p className="text-sm text-gray-500">Add your first driver to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver) => (
                <div key={driver.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                        <p className="text-sm text-gray-600">{driver.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        driver.is_available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {driver.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="font-medium text-gray-900">{driver.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Status</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {driver.is_available ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Parking History</h2>
          
          {parkingHistory.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-700 font-semibold mb-1">No Parking History</p>
              <p className="text-sm text-gray-500">Completed parking sessions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parkingHistory.map((session: any) => (
                <div key={session.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.vehicles?.vehicle_name || 'Unknown Vehicle'}</h3>
                      <p className="text-sm text-gray-600">{session.vehicles?.plate_number || 'N/A'}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      Completed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Customer</p>
                      <p className="font-medium text-gray-900">{session.users?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Location</p>
                      <p className="font-medium text-gray-900">{session.parking_sites?.name || 'N/A'}</p>
                    </div>
                    {session.parking_spot && (
                      <div>
                        <p className="text-gray-500 text-xs">Spot</p>
                        <p className="font-medium text-gray-900">{session.parking_spot}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 text-xs">Payment</p>
                      <p className="font-medium text-gray-900">₹{session.payment_amount || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Driver</h2>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter driver's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter driver's email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter driver's phone number"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
                  Driver is available for assignments
                </label>
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
                onClick={handleAddDriver}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Driver'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}





