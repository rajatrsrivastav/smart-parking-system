'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import {Car} from 'lucide-react'
import { API_BASE_URL } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28'

export default function UserHomePage() {
  const { data: activeSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'session'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/my-session/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      const result = await response.json();
      return result.success ? result.data : null;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for active session
  });

  const { data: parkingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'history'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/my-history/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const result = await response.json();
      return result.success ? result.data : [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const loading = sessionLoading || historyLoading;

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
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-6 pt-12 pb-8 rounded-b-3xl">
          <h1 className="text-2xl font-bold mb-2">Smart Parking</h1>
          <p className="text-indigo-100 text-sm">Welcome back!</p>
          
          <div className="mt-6 bg-indigo-500/50 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl"><Car size={50}/></div>
              <div>
                <p className="text-base font-semibold">Premium Parking Solution</p>
                <p className="text-xs text-indigo-100">Trusted by 1M+ users nationwide</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 -mt-6 pb-6">
          <Link href="/user/scan">
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 active:scale-95 transition-transform">
              <div className="bg-orange-500 rounded-2xl p-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Scan to Park</h3>
                <p className="text-sm text-gray-500">Scan QR code at parking entrance</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Parking</h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : activeSession ? (
              <Link href="/user/ticket">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-sm p-5 mb-6 active:scale-95 transition-transform">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold">Active Parking Session</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-100">Location</span>
                      <span className="font-medium">{activeSession.parking_sites?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-100">Vehicle</span>
                      <span className="font-medium">{activeSession.vehicles?.plate_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-100">Spot</span>
                      <span className="font-medium">{activeSession.parking_spot || 'Assigning...'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-100">Duration</span>
                      <span className="font-medium">{formatDuration(activeSession.entry_time, new Date().toISOString())}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-sm text-green-100">Tap to view ticket</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-100 rounded-2xl shadow-sm p-8 text-center mb-6">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-600 font-medium">No Active Parking</p>
                <p className="text-sm text-gray-500 mt-1">Your parked vehicles will appear here</p>
              </div>
            )}

            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Parking</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : parkingHistory.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No parking history yet</p>
                <p className="text-sm text-gray-400 mt-1">Scan QR code to park your vehicle</p>
              </div>
            ) : (
              <div className="space-y-3 pb-20">
                {parkingHistory.slice(0, 3).map((parking: any) => (
                  <div key={parking.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{parking.parking_sites?.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-500">{parking.parking_sites?.address}</span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gray-900">₹{parking.payment_amount || 0}</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {parking.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(parking.exit_time)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>{parking.vehicles?.plate_number}</span>
                      </div>
                      <span>{formatDuration(parking.entry_time, parking.exit_time)}</span>
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
