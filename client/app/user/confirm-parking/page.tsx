'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';
const DEMO_VEHICLE_ID = 'vehicle-id-here';
const DEMO_SITE_ID = 'site-id-here';

export default function ConfirmParkingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'vehicles'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/sites`);
      if (!response.ok) throw new Error('Failed to fetch sites');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // Sites don't change often
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
      if (!response.ok) throw new Error('Failed to create parking request');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'session'] });
      router.push('/user/ticket');
    },
  });

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0]);
    }
  }, [vehicles, sites, selectedVehicle, selectedSite]);

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
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Confirm Parking</h1>
        </div>

        <div className="px-6 py-6 pb-24">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-green-800 font-medium">Auto-filled from saved vehicle</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
            <h2 className="font-semibold text-gray-900">Vehicle Details</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Owner</span>
              <span className="font-medium text-gray-900">John Doe</span>
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
              <span className="font-medium text-gray-900">+91 98765 43210</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h2 className="font-semibold text-gray-900">Parking Location</h2>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">{selectedSite?.name || 'Loading...'}</p>
            <p className="text-sm text-gray-500 mt-1">{selectedSite?.address || ''}, {selectedSite?.city || ''}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <h2 className="font-semibold text-gray-900">Parking Fee</h2>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Fixed Parking Fee</span>
            <span className="text-2xl font-bold text-green-600">₹{selectedSite?.fixed_parking_fee || '0'}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">This amount will be charged immediately upon confirmation</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Payment Method</h2>
          <p className="text-sm text-gray-500 mb-4">Choose how you want to pay</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPayment('upi')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedPayment === 'upi'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  selectedPayment === 'upi' ? 'bg-indigo-600' : 'bg-indigo-100'
                }`}>
                  <svg className={`w-6 h-6 ${selectedPayment === 'upi' ? 'text-white' : 'text-indigo-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${selectedPayment === 'upi' ? 'text-indigo-600' : 'text-gray-700'}`}>
                  UPI
                </span>
                {selectedPayment === 'upi' && (
                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedPayment('netbanking')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedPayment === 'netbanking'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  selectedPayment === 'netbanking' ? 'bg-indigo-600' : 'bg-indigo-100'
                }`}>
                  <svg className={`w-6 h-6 ${selectedPayment === 'netbanking' ? 'text-white' : 'text-indigo-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${selectedPayment === 'netbanking' ? 'text-indigo-600' : 'text-gray-700'}`}>
                  Netbanking
                </span>
                {selectedPayment === 'netbanking' && (
                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Link href="/user/home" className="flex-1">
              <button className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50">
                Cancel
              </button>
            </Link>
            <button
              onClick={handleConfirmParking}
              disabled={createParkingMutation.isPending}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-semibold"
            >
              {createParkingMutation.isPending ? 'Creating...' : 'Confirm Parking'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
