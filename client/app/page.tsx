'use client';

import Link from 'next/link';
import {Car} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Car size={72}/>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Smart Parking</h1>
          <p className="text-indigo-100">Premium Valet Parking Solution</p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Login As</h2>
          <p className="text-gray-500 text-center mb-8">Select your role to continue</p>

          <div className="space-y-4">
            <Link href="/user/home">
              <div className="group p-5 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-2xl cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-indigo-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">User</h3>
                    <p className="text-sm text-gray-600">Park & retrieve your vehicle</p>
                  </div>
                  <svg className="w-6 h-6 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link href="/manager">
              <div className="group p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Manager</h3>
                    <p className="text-sm text-gray-600">Manage parking operations</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-800 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link href="/driver">
              <div className="group p-5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Driver</h3>
                    <p className="text-sm text-gray-600">Valet service console</p>
                  </div>
                  <svg className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link href="/super-admin">
              <div className="group p-5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-purple-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Super Admin</h3>
                    <p className="text-sm text-gray-600">System administration</p>
                  </div>
                  <svg className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="text-center mt-8 text-white/80 text-sm">
          <p>Trusted by 1M+ users nationwide</p>
        </div>
      </div>
    </div>
  );
}
