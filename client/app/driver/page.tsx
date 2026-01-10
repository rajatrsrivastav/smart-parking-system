'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';

const DEMO_DRIVER_ID = '7cafde48-a1fb-4f9b-a86f-676a4b15764d';

export default function DriverPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState('Driver');

  useEffect(() => {
    loadDriverDetails();
    loadRequests();
    const interval = setInterval(loadRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDriverDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/${DEMO_DRIVER_ID}`);
      const result = await response.json();
      if (result.success && result.data && result.data.name) {
        setDriverName(result.data.name);
      }
    } catch (error) {
      console.error('Failed to load driver details:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/requests`);
      const result = await response.json();
      if (result.success && result.data) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
    setLoading(false);
  };

  const handleAccept = async (requestId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/accept/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: DEMO_DRIVER_ID })
      });
      const result = await response.json();
      if (result.success) {
        loadRequests();
        alert('Request accepted!');
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const parkRequests = requests.filter(r => r.assignment_type === 'park');
  const retrieveRequests = requests.filter(r => r.assignment_type === 'retrieve');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/')} className="p-1 hover:bg-indigo-700 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold">Driver Console</h1>
            </div>
            <button className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {requests.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          <p className="text-indigo-100 text-sm">Welcome back,</p>
          <p className="text-lg font-semibold">{driverName}</p>
        </div>

        <div className="px-6 pb-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-700 font-semibold mb-1">No Pending Requests</p>
              <p className="text-sm text-gray-500">New assignments will appear here</p>
            </div>
          ) : (
            <>
              {retrieveRequests.map((request) => (
                <div key={request.id} className="-mt-3 mb-6">
                  <div className="bg-white rounded-2xl shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      <h2 className="font-bold text-gray-900">Retrieval Request</h2>
                    </div>

                    <div className="border-2 border-orange-200 rounded-2xl p-4 bg-orange-50 mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 rounded-full p-3">
                            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.parking_sessions.vehicles.vehicle_name}</h3>
                            <p className="text-sm text-gray-600">{request.parking_sessions.vehicles.plate_number}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                          Retrieve Vehicle
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Customer:</span>
                          <span className="text-gray-900">{request.parking_sessions.users.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Location:</span>
                          <span className="text-gray-900">{request.parking_sessions.parking_sites.name}</span>
                        </div>

                        {request.parking_sessions.parking_spot && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Spot:</span>
                            <span className="text-gray-900 font-bold">{request.parking_sessions.parking_spot}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Requested at:</span>
                          <span className="text-gray-900">{formatTime(request.assigned_at)}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleAccept(request.id)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        Accept Assignment
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {parkRequests.map((request) => (
                <div key={request.id} className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Parking Request</h2>

                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="border-2 border-green-200 rounded-2xl p-4 bg-green-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-full p-3">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.parking_sessions.vehicles.vehicle_name}</h3>
                            <p className="text-sm text-gray-600">{request.parking_sessions.vehicles.plate_number}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                          Park Vehicle
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Customer:</span>
                          <span className="text-gray-900">{request.parking_sessions.users.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Location:</span>
                          <span className="text-gray-900">{request.parking_sessions.parking_sites.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Requested at:</span>
                          <span className="text-gray-900">{formatTime(request.assigned_at)}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleAccept(request.id)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                      >
                        Accept & Start Parking
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{requests.length}</div>
              <div className="text-xs text-gray-500 mt-1">Pending</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{parkRequests.length}</div>
              <div className="text-xs text-gray-500 mt-1">Park</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{retrieveRequests.length}</div>
              <div className="text-xs text-gray-500 mt-1">Retrieve</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav role="driver" />
    </div>
  );
}
