'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    staleTime: 10 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
  });

  const vehicleCount = vehicles?.length || 0;
  const loading = userLoading || vehiclesLoading;

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <div className="bg-[#6366f1] text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-sm text-gray-500 mb-4">Manage your account and preferences</p>

        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#6366f1] rounded-full flex items-center justify-center text-white text-xl font-bold">
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

        <div className="bg-white rounded-xl divide-y divide-gray-100">
          <Link href="/user/vehicles">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#eef2ff] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Manage Vehicles</h3>
                <p className="text-sm text-gray-500">
                  {loading ? 'Loading...' : `${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''} saved`}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/user/history">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#eef2ff] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Transaction History</h3>
                <p className="text-sm text-gray-500">View all your transactions</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#eef2ff] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Help & Support</h3>
              <p className="text-sm text-gray-500">Get assistance</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#eef2ff] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">FAQ</h3>
              <p className="text-sm text-gray-500">Frequently asked questions</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <Link href="/">
          <button className="w-full mt-4 py-3.5 bg-[#fef2f2] text-[#dc2626] rounded-xl font-semibold">
            Logout
          </button>
        </Link>
      </div>

      <BottomNav role="user" />
    </div>
  );
}
