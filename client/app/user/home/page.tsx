'use client';

import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28'

export default function UserHomePage() {
  const { data: parkingHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'history'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/my-history/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const result = await response.json();
      return result.success ? result.data : [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const loading = historyLoading;

  const formatDuration = (entryTime: string, exitTime?: string) => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const diffMs = exit.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-[#6366f1] text-white px-5 pt-12 pb-6">
          <h1 className="text-xl font-semibold">Smart Parking</h1>
          <p className="text-white/80 text-sm mt-0.5">Welcome back!</p>
          
          <div className="mt-4 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-yellow-300 text-xs font-medium mb-1">
                  <span>🏆</span>
                  <span>#1 IN INDIA</span>
                </div>
                <p className="text-white font-semibold text-base">Premium Parking Solution</p>
                <p className="text-white/70 text-xs mt-0.5">Trusted by 1M+ users nationwide</p>
              </div>
              <div className="text-4xl">🚗</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <Link href="/user/scan">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="bg-[#6366f1] rounded-xl p-3">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-[15px]">Scan to Park</h3>
                <p className="text-sm text-gray-500">Scan QR code at parking entrance</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <div className="mt-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Recent Parking</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : parkingHistory.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No parking history yet</p>
                <p className="text-sm text-gray-400 mt-1">Scan QR code to park your vehicle</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parkingHistory.slice(0, 3).map((parking: Record<string, unknown>) => (
                  <div key={parking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-[15px]">{parking.parking_sites?.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-500">{parking.parking_sites?.address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-gray-900">₹{parking.payment_amount || 0}</span>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded font-medium">
                            completed
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDate(parking.exit_time || parking.entry_time)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                        </svg>
                        <span>{parking.vehicles?.plate_number}</span>
                      </div>
                      <span className="ml-auto">{formatDuration(parking.entry_time, parking.exit_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav role="user" />
    </div>
  );
}
