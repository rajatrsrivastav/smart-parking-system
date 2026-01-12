'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Truck, MapPin } from 'lucide-react';

const DEMO_USER_ID = 'd7eb7b17-6d46-4df7-8b43-c50206863e28';

interface ParkingSession {
  id: string;
  status: string;
  entry_time: string;
  vehicles: { vehicle_name: string; plate_number: string };
  parking_sites: { name: string; address: string };
}

export default function RetrievalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pollInterval, setPollInterval] = useState(1000);

  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['user', DEMO_USER_ID, 'current-session'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/parking-session/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch session');
      return result.data;
    },
    refetchInterval: pollInterval,
    staleTime: 0,
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
      queryClient.invalidateQueries({ queryKey: ['user', DEMO_USER_ID, 'current-session'] });
      router.push('/user/home');
    },
  });

  const retrievalSteps = [
    {
      id: 1,
      title: 'Request Received',
      description: 'Valet has been notified',
      icon: CheckCircle2,
      status: session ? 'completed' : 'pending',
    },
    {
      id: 2,
      title: 'Car on the Way',
      description: 'Vehicle is being brought',
      icon: Truck,
      status: session?.status === 'in_transit' ? 'active' : session ? 'completed' : 'pending',
    },
    {
      id: 3,
      title: 'Car Arriving',
      description: 'Ready for pickup',
      icon: MapPin,
      status: session?.status === 'ready_for_retrieval' ? 'active' : session?.status === 'in_transit' ? 'completed' : 'pending',
    },
  ];

  const getStatusMessage = () => {
    if (!session) return '';
    if (session.status === 'ready_for_retrieval') {
      return 'Your vehicle is at the pickup point';
    }
    if (session.status === 'in_transit') {
      return 'Vehicle is being brought';
    }
    return 'Valet has been notified';
  };

  const getStatusTitle = () => {
    if (!session) return '';
    if (session.status === 'ready_for_retrieval') {
      return 'Car Arriving';
    }
    if (session.status === 'in_transit') {
      return 'Car on the Way';
    }
    return 'Request Received';
  };

  const getStatusColor = () => {
    if (!session) return 'bg-gray-100';
    return 'bg-[#ecfdf5]';
  };

  const handleCompleteParking = () => {
    if (session) {
      completeParkingMutation.mutate(session.id);
    }
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
          <h1 className="text-xl font-semibold">Vehicle Retrieval</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
            <p className="text-gray-500 mt-4">Loading retrieval status...</p>
          </div>
        ) : session && ['retrieval_requested', 'in_transit', 'ready_for_retrieval'].includes(session.status) ? (
          <>
            <div className={`${getStatusColor()} border border-[#a7f3d0] rounded-xl p-4 mb-6`}>
              <div className="flex items-start gap-3">
                <div className="bg-[#22c55e] rounded-full p-3 flex-shrink-0">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-medium text-gray-900">{getStatusTitle()}</h2>
                  <p className="text-sm text-gray-600">{getStatusMessage()}</p>
                  {session.status === 'ready_for_retrieval' && (
                    <p className="text-sm text-[#16a34a] mt-2">Please proceed to pickup</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
              <h2 className="font-medium text-gray-900 mb-4">Retrieval Progress</h2>
              
              <div className="space-y-4">
                {retrievalSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === 'completed';
                  const isActive = step.status === 'active';
                  const isPending = step.status === 'pending';

                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? 'bg-[#dcfce7] border-2 border-[#16a34a]'
                              : isActive
                              ? 'bg-[#22c55e] border-2 border-[#16a34a]'
                              : 'bg-gray-100 border-2 border-gray-300'
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              isCompleted
                                ? 'text-[#16a34a]'
                                : isActive
                                ? 'text-white'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                        {index < retrievalSteps.length - 1 && (
                          <div
                            className={`w-1 h-12 mt-2 ${
                              isCompleted || isActive ? 'bg-[#16a34a]' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pt-1">
                        <h3 className={`font-medium ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
              <h2 className="font-medium text-gray-900 mb-4">Parking Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium text-gray-900">{session.vehicles.vehicle_name}</p>
                    <p className="text-sm text-gray-600">{session.vehicles.plate_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{session.parking_sites.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Entry Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(session.entry_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mb-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.26.559.934 1.42 2.478 2.964 1.545 1.545 2.405 2.218 2.964 2.478l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2.5C5.75 18 2 14.25 2 9.5V3z" />
              </svg>
              Call Support
            </button>

            {session.status === 'ready_for_retrieval' && (
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">🎉</span>
                  <p className="font-medium text-[#065f46]">Your vehicle is ready at the pickup point!</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p className="text-gray-700 font-medium">No Retrieval Request</p>
            <p className="text-sm text-gray-500 mt-2">Request vehicle retrieval from your parking ticket to see status here</p>
            <button
              onClick={() => router.push('/user/ticket')}
              className="mt-4 px-6 py-2 bg-[#6366f1] text-white rounded-xl font-medium text-sm"
            >
              Back to Ticket
            </button>
          </div>
        )}
      </div>

      {session && session.status === 'ready_for_retrieval' && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-[#f8f9fa]">
          <button
            onClick={handleCompleteParking}
            disabled={completeParkingMutation.isPending}
            className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
          >
            {completeParkingMutation.isPending ? 'Completing...' : 'Exit & End Parking'}
          </button>
        </div>
      )}

      <BottomNav role="user" />
    </div>
  );
}
