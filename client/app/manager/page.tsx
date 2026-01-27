'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
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

export default function ManagerPage() {
  const [dashboardData, setDashboardData] = useState<Record<string, unknown> | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(false);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
    loadDrivers();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="h-full flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] relative">
      <div className="bg-[#1f2937] text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-start mb-2">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
        <h1 className="text-xl font-semibold">Manager Dashboard</h1>
        <p className="text-gray-400 text-sm">Manage valet assignments and parking operations</p>
      </div>

      <div className="px-4 -mt-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-gray-900">{(dashboardData as any)?.activeCars || 0}</div>
            <div className="text-[10px] text-gray-500">Active Cars</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-[#f97316]">{(dashboardData as any)?.retrieving || 0}</div>
            <div className="text-[10px] text-gray-500">Retrieving</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-gray-900">{(dashboardData as any)?.totalToday || 0}</div>
            <div className="text-[10px] text-gray-500">Total Today</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-[#22c55e]">₹{(dashboardData as any)?.revenue || 0}</div>
            <div className="text-[10px] text-gray-500">Revenue</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto">
        <h2 className="text-base font-semibold text-gray-900">Active Parking Sessions</h2>

        {!dashboardData?.assignments || (dashboardData.assignments as any[]).length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center mb-4">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-700 font-medium mb-1">No Active Sessions</p>
            <p className="text-sm text-gray-500">Active parking sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {(dashboardData.assignments as any[]).map((assignment: Record<string, unknown>) => (
              <div key={assignment.id as string} className="bg-white rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{(assignment.vehicles as any).vehicle_name}</h3>
                    <p className="text-sm text-gray-500">{(assignment.vehicles as any).plate_number}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-[#dcfce7] text-[#16a34a] text-xs rounded-full font-medium">
                    Parked
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Customer</p>
                    <p className="font-medium text-gray-900">{(assignment.users as any).name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Location</p>
                    <p className="font-medium text-gray-900">{(assignment.parking_sites as any).name}</p>
                  </div>
                  {(assignment.parking_spot as any) && (
                    <div>
                      <p className="text-gray-400 text-xs">Spot</p>
                      <p className="font-medium text-gray-900">{assignment.parking_spot as any}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p className="font-medium text-gray-900">{getDuration(assignment.entry_time as string)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-start mb-3">
          <h2 className="text-base font-semibold text-gray-900">Driver Management</h2>
        </div>

        {driversLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading drivers...</div>
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center mb-4">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-700 font-medium mb-1">No Drivers</p>
            <p className="text-sm text-gray-500">Add your first driver to get started</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eef2ff] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                    <p className="text-sm text-gray-500">{driver.phone}</p>
                  </div>
                  <span className={driver.is_available ? 'px-2 py-0.5 text-xs rounded-full font-medium bg-[#dcfce7] text-[#16a34a]' : 'px-2 py-0.5 text-xs rounded-full font-medium bg-[#fee2e2] text-[#dc2626]'}>
                    {driver.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

