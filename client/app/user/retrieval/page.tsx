'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function RetrievalPage() {
  const [step, setStep] = useState<'request' | 'retrieving' | 'arriving'>('request');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 'request') {
      const timer = setTimeout(() => {
        setStep('retrieving');
        setProgress(33);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (step === 'retrieving') {
      const timer = setTimeout(() => {
        setStep('arriving');
        setProgress(66);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (step === 'arriving') {
      setProgress(100);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center gap-4">
          <Link href="/user/ticket">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Vehicle Retrieval</h1>
        </div>

        <div className="px-6 py-6">
        {step === 'request' && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Request Received</h2>
                <p className="text-blue-100 text-sm">Our valet has been notified</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Estimated time: 5-7 minutes</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-6">Retrieval Progress</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                step !== 'request' ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {step !== 'request' ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-1 ${step !== 'request' ? 'text-green-600' : 'text-gray-900'}`}>
                  Request Received
                </h3>
                <p className="text-sm text-gray-500">Valet has been notified</p>
              </div>
            </div>

            <div className={`ml-6 w-0.5 h-8 transition-colors ${step !== 'request' ? 'bg-green-500' : 'bg-gray-200'}`}></div>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                step === 'arriving' ? 'bg-green-500' : step === 'retrieving' ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {step === 'arriving' ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step === 'retrieving' ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-1 ${
                  step === 'arriving' ? 'text-green-600' : step === 'retrieving' ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  Car on the Way
                </h3>
                <p className="text-sm text-gray-500">Vehicle is being brought</p>
              </div>
            </div>

            <div className={`ml-6 w-0.5 h-8 transition-colors ${step === 'arriving' ? 'bg-green-500' : 'bg-gray-200'}`}></div>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                step === 'arriving' ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {step === 'arriving' ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-1 ${step === 'arriving' ? 'text-gray-900' : 'text-gray-400'}`}>
                  Car Arriving
                </h3>
                <p className="text-sm text-gray-500">Ready for pickup</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Parking Details</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              <div className="flex-1">
                <div className="text-gray-500">Vehicle</div>
                <div className="font-semibold text-gray-900">Toyota Camry</div>
                <div className="text-xs text-gray-600">MH 12 AB 1234</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="text-gray-500">Location</div>
                <div className="font-semibold text-gray-900">Inorbit Mall</div>
                <div className="text-xs text-gray-600">Malad West, Mumbai</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <div>
            <h3 className="font-semibold text-indigo-900 mb-1">Need Help?</h3>
            <p className="text-sm text-indigo-700">Contact our support team if you have any questions</p>
            <button className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Call Support →
            </button>
          </div>
        </div>
        </div>
      </div>

      <BottomNav role="user" />
    </div>
  );
}
