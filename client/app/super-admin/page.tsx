'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

export default function SuperAdminPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals'>('overview');

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id);
    }
    if (selectedSiteId) {
      loadDashboard(selectedSiteId);
    }
  }, [selectedSiteId, sites]);

  const fetchSites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sites`);
      const result = await response.json();
      if (result.success && result.data) {
        setSites(result.data);
        if (result.data.length > 0) {
          setSelectedSiteId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const loadDashboard = async (siteId?: string) => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/api/super-admin/dashboard`);
      if (siteId) {
        url.searchParams.append('siteId', siteId);
      }
      const response = await fetch(url.toString());
      const result = await response.json();
      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <div className="bg-[#7c3aed] text-white px-4 pt-12 pb-16 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">Super Admin</h1>
          <div className="w-8"></div>
        </div>
        <p className="text-white/70 text-sm text-center">System overview and approvals</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-10">
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Site
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <select
              value={selectedSiteId || ''}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#a78bfa] rounded-xl focus:outline-none focus:border-[#7c3aed] appearance-none bg-white text-gray-900 font-medium text-sm"
            >
              <option value="">Select a parking site...</option>
              {sites.map((site: any) => (
                <option key={site.id} value={site.id}>
                  {site.name} - {site.address || 'No address'}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-full text-sm font-medium ${
              activeTab === 'overview' 
                ? 'bg-[#7c3aed] text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-5 py-2 rounded-full text-sm font-medium ${
              activeTab === 'approvals' 
                ? 'bg-[#7c3aed] text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Approvals
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="font-semibold text-gray-900">Today's Performance</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f5f3ff] rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Tickets Issued</div>
              <div className="text-2xl font-bold text-[#7c3aed]">
                {dashboardData?.todayPerformance?.ticketsIssued || 0}
              </div>
            </div>
            <div className="bg-[#f5f3ff] rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Collection</div>
              <div className="text-2xl font-bold text-[#7c3aed]">
                ₹{dashboardData?.todayPerformance?.collection?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="font-semibold text-gray-900">Overall Statistics</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-xl">
              <div className="w-10 h-10 bg-[#ede9fe] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Tickets</div>
                <div className="text-lg font-bold text-gray-900">
                  {dashboardData?.statistics?.totalTickets || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-xl">
              <div className="w-10 h-10 bg-[#ede9fe] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Collection</div>
                <div className="text-lg font-bold text-gray-900">
                  ₹{dashboardData?.statistics?.totalCollection?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-xl">
              <div className="w-10 h-10 bg-[#ede9fe] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Active Parking</div>
                <div className="text-lg font-bold text-gray-900">
                  {dashboardData?.statistics?.activeParking || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedSiteId && sites.find((s: any) => s.id === selectedSiteId) && (
          <div className="bg-[#f5f3ff] border border-[#c4b5fd] rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              {sites.find((s: any) => s.id === selectedSiteId)?.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {sites.find((s: any) => s.id === selectedSiteId)?.address}
            </p>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-500">Available Slots</p>
                <p className="text-lg font-bold text-[#7c3aed]">
                  {sites.find((s: any) => s.id === selectedSiteId)?.available_slots || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Slots</p>
                <p className="text-lg font-bold text-gray-900">
                  {sites.find((s: any) => s.id === selectedSiteId)?.total_slots || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
