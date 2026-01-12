'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { API_BASE_URL } from '@/lib/api';

const DEMO_DRIVER_ID = '7cafde48-a1fb-4f9b-a86f-676a4b15764d';

export default function DriverPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState('Driver');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string>(DEMO_DRIVER_ID);

  useEffect(() => {
    loadDriverId();
  }, []);

  useEffect(() => {
    if (driverId) {
      loadDriverDetails();
      loadRequests();
      const interval = setInterval(loadRequests, 10000);
      return () => clearInterval(interval);
    }
  }, [driverId]);

  const loadDriverId = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers`);
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        setDriverId(result.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load driver id:', error);
    }
  };

  const loadDriverDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/${driverId}`);
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
      const [requestsResponse, activeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/driver/requests`),
        fetch(`${API_BASE_URL}/api/driver/${driverId}/active`)
      ]);

      const requestsResult = await requestsResponse.json();
      const activeResult = await activeResponse.json();

      if (requestsResult.success && requestsResult.data) {
        console.log('Requests data:', requestsResult.data);
        setRequests(requestsResult.data);
      }
      if (activeResult.success && activeResult.data) {
        console.log('Active assignments data:', activeResult.data);
        setActiveAssignments(activeResult.data);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
    setLoading(false);
  };

  const handleAccept = async (requestId: string) => {
    try {
      console.log('Accepting request:', requestId);
      setProcessingId(requestId);
      const response = await fetch(`${API_BASE_URL}/api/driver/accept/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      });
      const result = await response.json();
      console.log('Accept response:', result);
      if (result.success) {
        // Add a small delay to ensure backend is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadRequests();
        alert('Request accepted!');
      } else {
        alert('Failed to accept request: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Error accepting request: ' + error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (assignment: any) => {
    console.log('handleComplete called with assignment:', assignment);
    try {
      setProcessingId(assignment.id);
      const endpoint = assignment.assignment_type === 'retrieve'
        ? `/api/driver/complete-retrieval`
        : `/api/driver/complete-parking`;

      console.log('Calling endpoint:', endpoint);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignment.id,
          ...(assignment.assignment_type === 'park' && { parking_spot: 'A-01' })
        })
      });

      const result = await response.json();
      console.log('API response:', result);
      if (result.success) {
        // Add a small delay to ensure backend is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadRequests();
        alert('Assignment completed successfully!');
      } else {
        alert('Failed to complete assignment: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to complete assignment:', error);
      alert('Error completing assignment: ' + error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const parkRequests = requests.filter(r => r.assignment_type === 'park');
  const retrieveRequests = requests.filter(r => r.assignment_type === 'retrieve');

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <div className="bg-[#6366f1] text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="w-8 h-8 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Driver Console</h1>
          </div>
          <button className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {requests.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
        <p className="text-white/70 text-sm">Welcome back,</p>
        <p className="text-lg font-medium">{driverName}</p>
      </div>

      <div className="px-4 -mt-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-[#6366f1]">{requests.length}</div>
            <div className="text-[10px] text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-[#3b82f6]">{activeAssignments.length}</div>
            <div className="text-[10px] text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-[#22c55e]">{parkRequests.length}</div>
            <div className="text-[10px] text-gray-500">Park</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-[#f97316]">{retrieveRequests.length}</div>
            <div className="text-[10px] text-gray-500">Retrieve</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading requests...</div>
        ) : requests.length === 0 && activeAssignments.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-700 font-semibold mb-1">No Pending Requests</p>
            <p className="text-sm text-gray-500">New assignments will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {retrieveRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#fff7ed] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#f97316]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Retrieval Request</span>
                  <span className="ml-auto px-2 py-0.5 bg-[#ffedd5] text-[#ea580c] text-xs rounded-full font-medium">
                    Retrieve
                  </span>
                </div>

                <div className="border border-[#fed7aa] rounded-xl p-3 bg-[#fffbf5]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#ffedd5] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#f97316]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.parking_sessions.vehicles.vehicle_name}</h3>
                      <p className="text-sm text-gray-500">{request.parking_sessions.vehicles.plate_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">Customer:</span>
                      <span className="text-gray-900">{request.parking_sessions.users.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900">{request.parking_sessions.parking_sites.name}</span>
                    </div>
                    {request.parking_sessions.parking_spot && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500">Spot:</span>
                        <span className="text-gray-900 font-bold">{request.parking_sessions.parking_spot}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-500">Requested:</span>
                      <span className="text-gray-900">{formatTime(request.assigned_at)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAccept(request.id)}
                    disabled={processingId === request.id}
                    className="w-full py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {processingId === request.id ? 'Processing...' : 'Accept Assignment'}
                    {processingId !== request.id && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {parkRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#f0fdf4] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Parking Request</span>
                  <span className="ml-auto px-2 py-0.5 bg-[#dcfce7] text-[#16a34a] text-xs rounded-full font-medium">
                    Park
                  </span>
                </div>

                <div className="border border-[#bbf7d0] rounded-xl p-3 bg-[#f0fdf4]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#dcfce7] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.parking_sessions.vehicles.vehicle_name}</h3>
                      <p className="text-sm text-gray-500">{request.parking_sessions.vehicles.plate_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">Customer:</span>
                      <span className="text-gray-900">{request.parking_sessions.users.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900">{request.parking_sessions.parking_sites.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-500">Requested:</span>
                      <span className="text-gray-900">{formatTime(request.assigned_at)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAccept(request.id)}
                    disabled={processingId === request.id}
                    className="w-full py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all"
                  >
                    {processingId === request.id ? 'Processing...' : 'Accept & Start Parking'}
                  </button>
                </div>
              </div>
            ))}

            {activeAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#eff6ff] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {assignment.assignment_type === 'retrieve' ? 'Retrieving Vehicle' : 'Parking Vehicle'}
                  </span>
                  <span className="ml-auto px-2 py-0.5 bg-[#dbeafe] text-[#2563eb] text-xs rounded-full font-medium">
                    In Progress
                  </span>
                </div>

                <div className="border border-[#93c5fd] rounded-xl p-3 bg-[#eff6ff]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#dbeafe] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#3b82f6]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{assignment.parking_sessions.vehicles.vehicle_name}</h3>
                      <p className="text-sm text-gray-500">{assignment.parking_sessions.vehicles.plate_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">Customer:</span>
                      <span className="text-gray-900">{assignment.parking_sessions.users.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900">{assignment.parking_sessions.parking_sites.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-500">Started:</span>
                      <span className="text-gray-900">{formatTime(assignment.assigned_at)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      console.log('Button clicked!');
                      handleComplete(assignment);
                    }}
                    disabled={processingId === assignment.id}
                    className="w-full py-2.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {processingId === assignment.id ? 'Completing...' : 'Mark as Completed'}
                    {processingId !== assignment.id && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="driver" />
    </div>
  );
}
