'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';

export default function TicketPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session, isLoading: loading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'session'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/my-session/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch session');
      return result.data;
    },
    refetchInterval: 30000,
  });

  const retrievalMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/request-retrieval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, user_id: DEMO_USER_ID }),
      });
      if (!response.ok) throw new Error('Retrieval request failed');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'session'] });
    },
  });

  const completeParkingMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/complete-parking-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) throw new Error('Failed to complete parking session');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'session'] });
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'history'] });
    },
  });

  useEffect(() => {
    if (session && session.status === 'retrieval_requested') {
      router.push('/user/retrieval');
    }
  }, [session, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
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

  const handleRequestRetrieval = () => {
    if (!session) return;
    retrievalMutation.mutate(session.id);
  };

  const handleCompleteParking = () => {
    if (!session) return;
    completeParkingMutation.mutate(session.id);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-gray-500">Loading ticket...</div>
        </div>
        <BottomNav role="user" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-5 py-6">
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <p className="text-gray-700 font-semibold mb-1">No Active Parking Session</p>
              <p className="text-sm text-gray-500">You don&apos;t have any active parking tickets</p>
              <Link href="/user/scan">
                <button className="mt-4 px-6 py-3 bg-[#6366f1] text-white rounded-xl font-medium">
                  Park Your Vehicle
                </button>
              </Link>
            </div>
          </div>
        </div>
        <BottomNav role="user" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-[#10b981] text-white px-5 py-3 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="font-medium text-sm">Active Parking Session</span>
        </div>

        <div className="px-5 py-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="text-center py-4 border-b border-dashed border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Smart Parking System</p>
              <h2 className="text-base font-semibold text-gray-900">Digital Parking Ticket</h2>
              <p className="text-[#6366f1] text-sm font-medium">{session.parking_sites.name}</p>
            </div>

            <div className="flex justify-center py-6 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-gray-50 rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-gray-50 rounded-l-full"></div>
              <div className="border border-gray-200 rounded-lg p-3">
                <svg className="w-28 h-28" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white"/>
                  <rect x="10" y="10" width="15" height="15" fill="black"/>
                  <rect x="30" y="10" width="5" height="5" fill="black"/>
                  <rect x="40" y="10" width="5" height="5" fill="black"/>
                  <rect x="50" y="10" width="10" height="10" fill="black"/>
                  <rect x="65" y="10" width="5" height="5" fill="black"/>
                  <rect x="75" y="10" width="15" height="15" fill="black"/>
                  <rect x="10" y="30" width="5" height="5" fill="black"/>
                  <rect x="20" y="30" width="5" height="5" fill="black"/>
                  <rect x="35" y="30" width="10" height="10" fill="black"/>
                  <rect x="50" y="30" width="5" height="5" fill="black"/>
                  <rect x="60" y="30" width="5" height="5" fill="black"/>
                  <rect x="75" y="30" width="5" height="5" fill="black"/>
                  <rect x="85" y="30" width="5" height="5" fill="black"/>
                  <rect x="10" y="50" width="10" height="10" fill="black"/>
                  <rect x="25" y="50" width="15" height="15" fill="black"/>
                  <rect x="45" y="50" width="5" height="5" fill="black"/>
                  <rect x="55" y="50" width="10" height="10" fill="black"/>
                  <rect x="70" y="50" width="5" height="5" fill="black"/>
                  <rect x="80" y="50" width="10" height="10" fill="black"/>
                  <rect x="10" y="75" width="15" height="15" fill="black"/>
                  <rect x="30" y="75" width="5" height="5" fill="black"/>
                  <rect x="40" y="75" width="10" height="10" fill="black"/>
                  <rect x="55" y="75" width="5" height="5" fill="black"/>
                  <rect x="65" y="75" width="10" height="10" fill="black"/>
                  <rect x="75" y="75" width="15" height="15" fill="black"/>
                </svg>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <span className="text-gray-400 text-lg">#</span>
                <div>
                  <p className="text-xs text-gray-500">Ticket ID</p>
                  <p className="font-medium text-gray-900">TK-{formatDate(session.entry_time).replace(/ /g, '-')}-{session.id.slice(-2)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="font-medium text-gray-900">{session.vehicles.vehicle_name}</p>
                  <p className="text-sm text-gray-500">{session.vehicles.plate_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{session.parking_sites.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Entry Time</p>
                  <p className="font-medium text-gray-900">{formatDate(session.entry_time)}, {formatTime(session.entry_time)}</p>
                  <p className="text-sm text-gray-500">Duration: {getDuration(session.entry_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Amount Paid</p>
                  <p className="font-medium text-gray-900">₹{session.payment_amount || 150}</p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-4 text-center">
              <p className="text-xs text-gray-400">Powered by Smart Parking</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {session.status === 'in_transit' || session.status === 'ready_for_retrieval' ? (
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#22c55e] rounded-full p-3 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {session.status === 'ready_for_retrieval' ? 'Car Arriving' : 'Car on the Way'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {session.status === 'ready_for_retrieval' ? 'Your vehicle is ready at the pickup point' : 'Vehicle is being brought to you'}
                    </p>
                    {session.status === 'ready_for_retrieval' && (
                      <div className="mt-4 pt-4 border-t border-[#a7f3d0]">
                        <button
                          onClick={handleCompleteParking}
                          disabled={completeParkingMutation.isPending}
                          className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
                        >
                          {completeParkingMutation.isPending ? 'Completing...' : 'Exit & End Parking'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRequestRetrieval}
                disabled={retrievalMutation.isPending}
                className="w-full py-3.5 bg-[#6366f1] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
                {retrievalMutation.isPending ? 'Requesting...' : 'Get My Car'}
              </button>
            )}

            <button className="w-full py-3.5 border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 bg-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Ticket
            </button>

            <button className="w-full py-3.5 border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 bg-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Ticket
            </button>
          </div>

          <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-xl p-3 flex items-start gap-2">
            <span className="text-lg">🎫</span>
            <div>
              <p className="font-medium text-[#92400e] text-sm">Keep this ticket handy</p>
              <p className="text-xs text-[#b45309]">Show this QR code when retrieving your vehicle</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav role="user" />
    </div>
  );
}