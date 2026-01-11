'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';

interface ParkingSession {
  id: string;
  entry_time: string;
  parking_spot: string;
  payment_status: string;
  payment_amount: number;
  status: string;
  vehicles: { vehicle_name: string; plate_number: string };
  parking_sites: { name: string; address: string };
}

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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const mockPaymentMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/mock-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, amount: 50 }),
      });
      if (!response.ok) throw new Error('Payment failed');
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'session'] });
    },
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

  useEffect(() => {
    if (session && session.payment_status === 'pending') {
      mockPaymentMutation.mutate(session.id);
    }
  }, [session]);

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
          <div className="bg-indigo-600 text-white px-6 pt-8 pb-6 flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-indigo-700 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Parking Ticket</h1>
          </div>

          <div className="px-6 -mt-4 pb-6">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <p className="text-gray-700 font-semibold mb-1">No Active Parking Session</p>
              <p className="text-sm text-gray-500">You don&apos;t have any active parking tickets</p>
              <Link href="/user/scan">
                <button className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold">
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
        <div className="bg-indigo-600 text-white px-6 pt-8 pb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-indigo-700 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Parking Ticket</h1>
        </div>

        <div className="px-6 -mt-4 pb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">
              {session.status === 'retrieval_requested' ? 'Waiting for Driver' : 'Active Parking Session'}
            </span>
          </div>
          {session.status === 'retrieval_requested' && (
            <div className="text-sm text-green-100">
              A driver has been notified and will bring your vehicle soon.
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 text-center">
            <div className="text-sm opacity-90 mb-1">Smart Parking System</div>
            <div className="text-xl font-bold mb-1">Digital Parking Ticket</div>
            <div className="text-indigo-200 text-sm">{session.parking_sites.name}</div>
          </div>

          <div className="flex justify-center py-8 bg-gray-50">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
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
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Ticket ID</div>
                <div className="font-semibold text-gray-900">{session.id.slice(0, 8).toUpperCase()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Vehicle</div>
                <div className="font-semibold text-gray-900">{session.vehicles.vehicle_name}</div>
                <div className="text-sm text-gray-600">{session.vehicles.plate_number}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Location</div>
                <div className="font-semibold text-gray-900">{session.parking_sites.address}</div>
                {session.parking_spot && (
                  <div className="text-sm text-gray-600">Spot: {session.parking_spot}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Entry Time</div>
                <div className="font-semibold text-gray-900">{formatDate(session.entry_time)}, {formatTime(session.entry_time)}</div>
                <div className="text-sm text-gray-600">Duration: {getDuration(session.entry_time)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Payment Status</div>
                <div className="font-semibold text-gray-900 capitalize">{session.payment_status}</div>
                {session.payment_amount && (
                  <div className="text-sm text-gray-600">Amount: ₹{session.payment_amount}</div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 text-center">
            <div className="text-xs text-gray-400">Powered by Smart Parking</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {session.payment_status === 'completed' ? (
            session.status === 'retrieval_requested' ? (
              <button
                disabled
                className="w-full py-4 bg-gray-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Waiting for Driver
              </button>
            ) : (
              <button
                onClick={handleRequestRetrieval}
                disabled={retrievalMutation.isPending}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
              >
                {retrievalMutation.isPending ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Requesting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                    Get My Car
                  </>
                )}
              </button>
            )
          ) : (
            <button className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payment Required
            </button>
          )}

          <button className="w-full py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Ticket
          </button>

          <button className="w-full py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Ticket
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold text-yellow-800 mb-1">⚠️ Keep this ticket handy</div>
            <div className="text-sm text-yellow-700">Show this QR code when retrieving your vehicle</div>
          </div>
        </div>
        </div>
      </div>

      <BottomNav role="user" />
    </div>
  );
}
