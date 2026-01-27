'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';

export default function ConfirmParkingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [selectedSite, setSelectedSite] = useState<Record<string, unknown> | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Record<string, unknown> | null>(null);

  const { data: vehicles = [] } = useQuery({
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: userData } = useQuery({
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

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/sites`);
      if (!response.ok) throw new Error('Failed to fetch sites');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const createParkingMutation = useMutation({
    mutationFn: async (data: { vehicle_id: string; site_id: string; payment_amount: number }) => {
      const response = await fetch(`${API_BASE_URL}/api/parking-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          ...data,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'session'] });
      router.push('/user/ticket');
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0]);
    }
  }, [vehicles, sites, selectedVehicle, selectedSite]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleConfirmParking = () => {
    if (!selectedVehicle || !selectedSite) {
      alert('Please select a vehicle and parking site.');
      return;
    }
    createParkingMutation.mutate({
      vehicle_id: selectedVehicle.id,
      site_id: selectedSite.id,
      payment_amount: selectedSite.fixed_parking_fee,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-[#6366f1] text-white px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-medium">Confirm Parking</h1>
        </div>

        <div className="px-5 py-4 pb-24">
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#10b981] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-[#065f46] font-medium">Auto-filled from saved vehicle</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              <h2 className="font-medium text-gray-900 text-[15px]">Vehicle Details</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Owner</span>
                <span className="font-medium text-gray-900">{userData?.name || 'Loading...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle</span>
                <span className="font-medium text-gray-900">{selectedVehicle?.vehicle_name || 'Loading...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Number Plate</span>
                <span className="font-medium text-gray-900">{selectedVehicle?.plate_number || 'Loading...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mobile</span>
                <span className="font-medium text-gray-900">{userData?.phone || 'Loading...'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <h2 className="font-medium text-gray-900 text-[15px]">Parking Location</h2>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900">{selectedSite?.name || 'Loading...'}</p>
              <p className="text-sm text-gray-500 mt-0.5">{selectedSite?.address || ''}{selectedSite?.city ? `, ${selectedSite.city}` : ''}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <h2 className="font-medium text-gray-900 text-[15px] mb-1">Payment Method</h2>
            <p className="text-sm text-gray-500 mb-4">Choose how you want to pay</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPayment('upi')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedPayment === 'upi'
                    ? 'border-[#6366f1] bg-[#f5f5ff]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPayment === 'upi' ? 'bg-[#6366f1]' : 'bg-[#f0f0ff]'
                  }`}>
                    <svg className={`w-5 h-5 ${selectedPayment === 'upi' ? 'text-white' : 'text-[#6366f1]'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${selectedPayment === 'upi' ? 'text-[#6366f1]' : 'text-gray-700'}`}>
                    UPI
                  </span>
                  {selectedPayment === 'upi' && (
                    <div className="w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedPayment('netbanking')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedPayment === 'netbanking'
                    ? 'border-[#6366f1] bg-[#f5f5ff]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPayment === 'netbanking' ? 'bg-[#6366f1]' : 'bg-[#f0f0ff]'
                  }`}>
                    <svg className={`w-5 h-5 ${selectedPayment === 'netbanking' ? 'text-white' : 'text-[#6366f1]'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${selectedPayment === 'netbanking' ? 'text-[#6366f1]' : 'text-gray-700'}`}>
                    Net Banking
                  </span>
                  {selectedPayment === 'netbanking' && (
                    <div className="w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Link
              href="/user/home"
              className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleConfirmParking}
              disabled={createParkingMutation.isPending}
              className="flex-1 bg-[#6366f1] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#5855eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createParkingMutation.isPending ? 'Confirming...' : 'Confirm Parking'}
            </button>
          </div>
        </div>
      </div>

      <BottomNav role="user" />
    </div>
  );
}