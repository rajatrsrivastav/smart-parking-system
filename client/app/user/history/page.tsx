'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';

interface ParkingHistory {
  id: string;
  entry_time: string;
  exit_time: string;
  payment_amount: number;
  payment_status: string;
  vehicles: { vehicle_name: string };
  parking_sites: { name: string; address: string };
}

export default function HistoryPage() {
  const router = useRouter();

  const { data: parkingHistory = [], isLoading: loading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'history'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/my-history/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch history');
      return result.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
          <h1 className="text-xl font-semibold">Parking History</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading history...</div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{parkingHistory.length} total bookings</p>

            <div className="space-y-3">
              {parkingHistory.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-500">No parking history found</p>
                </div>
              ) : (
                parkingHistory.map((parking: ParkingHistory) => (
                  <div key={parking.id} className="bg-white rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">{parking.parking_sites.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-500">{parking.parking_sites.address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{parking.payment_amount}</div>
                        <span className="inline-block px-2 py-0.5 bg-[#dcfce7] text-[#16a34a] text-xs rounded-full font-medium mt-1">
                          {parking.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 mt-3 pt-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(parking.exit_time)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span>{parking.vehicles.vehicle_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav role="user" />
    </div>
  );
}
