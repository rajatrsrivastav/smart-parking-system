'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';

interface Vehicle {
  id: string;
  vehicle_name: string;
  plate_number: string;
}

export default function ScanQRPage() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);

  const { data: vehicles = [], isLoading: loading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'vehicles'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: showVehicleSelect,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setScanned(true);
      setShowVehicleSelect(true);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full bg-[#1a1a2e] text-white relative flex flex-col">
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="w-6"></div>
        <h1 className="text-base font-medium">Scan QR Code</h1>
        <button
          onClick={() => router.back()}
          className="p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative w-64 h-64">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-[#6366f1] rounded-tl-2xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-[#6366f1] rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-[#6366f1] rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-[#6366f1] rounded-br-2xl"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-20 h-20 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z"/>
            </svg>
          </div>
          
          {!scanned && (
            <div className="absolute inset-x-4 h-0.5 bg-[#6366f1]" style={{ animation: 'scan 2s ease-in-out infinite', top: '0' }}></div>
          )}
        </div>
      </div>

      {!showVehicleSelect && (
        <div className="text-center px-6 pb-8">
          <p className="text-gray-400 text-sm">
            {scanned ? 'QR Code Detected!' : 'Scanning for QR code...'}
          </p>
          {scanned && <p className="text-[#6366f1] font-medium mt-1">Inorbit Mall</p>}
        </div>
      )}

      {showVehicleSelect && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 text-gray-900 animate-slide-up">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5"></div>
          <h2 className="text-lg font-semibold mb-1">Select Your Vehicle</h2>
          <p className="text-sm text-gray-500 mb-5">Choose which vehicle you&apos;re parking at Inorbit Mall</p>
          
          <div className="space-y-3 mb-5">
            {loading ? (
              <div className="text-center py-6 text-gray-500">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No vehicles found</div>
            ) : (
              vehicles.map((vehicle: Vehicle) => (
                <Link
                  key={vehicle.id}
                  href="/user/confirm-parking"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#6366f1] transition-colors"
                >
                  <div className="bg-[#f0f0ff] rounded-full p-2.5">
                    <svg className="w-5 h-5 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{vehicle.vehicle_name}</h3>
                    <p className="text-sm text-gray-500">{vehicle.plate_number}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/user/vehicles"
            className="block w-full py-3.5 bg-[#6366f1] text-white text-center rounded-xl font-medium"
          >
            Register New Vehicle
          </Link>
        </div>
      )}
    </div>
  );
}
