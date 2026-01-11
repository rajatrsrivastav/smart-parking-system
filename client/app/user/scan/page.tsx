'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${DEMO_USER_ID}/vehicles`);
      const result = await response.json();
      if (result.success && result.data) {
        setVehicles(result.data);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showVehicleSelect) {
      loadVehicles();
    }
  }, [showVehicleSelect]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScanned(true);
      setShowVehicleSelect(true);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full bg-gray-900 text-white relative flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Scan QR Code</h1>
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="relative w-80 h-80">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 8h8v8H3v-8zm2 6h4v-4H5v4zm8-14v8h8V3h-8zm6 6h-4V5h4v4zm-6 4h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
            </svg>
          </div>
          
          {!scanned && (
            <div className="absolute inset-x-0 h-1 bg-indigo-500" style={{ animation: 'scan 2s ease-in-out infinite', top: '0' }}></div>
          )}
        </div>
      </div>

      {!showVehicleSelect && (
        <div className="absolute bottom-20 left-0 right-0 text-center px-6">
          <p className="text-gray-300 mb-8">
            {scanned ? 'QR Code Detected!' : 'Scanning for QR code...'}
          </p>
          {scanned && <p className="text-indigo-400 font-semibold">Inorbit Mall</p>}
        </div>
      )}

      {showVehicleSelect && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 text-gray-900 animate-slide-up">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          <h2 className="text-xl font-bold mb-2">Select Your Vehicle</h2>
          <p className="text-sm text-gray-500 mb-6">Choose which vehicle you&apos;re parking at Inorbit Mall</p>
          
          <div className="space-y-3 mb-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No vehicles found</div>
            ) : (
              vehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href="/user/confirm-parking"
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-500 transition-colors"
                >
                  <div className="bg-indigo-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{vehicle.vehicle_name}</h3>
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
            className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-2xl font-semibold"
          >
            Register New Vehicle
          </Link>
        </div>
      )}
    </div>
  );
}
