'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28'

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface VehicleCount {
  count: number;
}

export default function SettingsPage() {
  const router = useRouter();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'profile'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/profile`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes, since profile doesn't change often
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'vehicles'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const vehicleCount = vehicles?.length || 0;
  const loading = userLoading || vehiclesLoading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-indigo-600 text-white px-6 pt-8 pb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>

        <div className="px-6 pb-6">
          <p className="text-sm text-gray-500 mb-6">Manage your account and preferences</p>

          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {loading ? '?' : (userData?.name?.charAt(0)?.toUpperCase() || 'U')}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {loading ? 'Loading...' : (userData?.name || 'User')}
                </h3>
                <p className="text-sm text-gray-500">
                  {loading ? 'Loading...' : (userData?.phone || 'Phone not available')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            <Link href="/user/vehicles">
              <div className="p-5 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Manage Vehicles</h3>
                  <p className="text-sm text-gray-500">
                    {loading ? 'Loading...' : `${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''} saved`}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <Link href="/">
            <button className="w-full mt-6 py-4 bg-red-50 text-red-600 rounded-2xl font-semibold hover:bg-red-100 transition-colors">
              Logout
            </button>
          </Link>
        </div>
      </div>

      <BottomNav role="user" />
    </div>
  );
}
