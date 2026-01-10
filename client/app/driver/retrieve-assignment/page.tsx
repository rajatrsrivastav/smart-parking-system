'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RetrieveAssignmentPage() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('request');
  
  const assignment = {
    vehicle: 'Honda City',
    plateNumber: 'MH 02 AB 1234',
    customer: 'John Doe',
    location: 'Inorbit Mall',
    address: 'Malad West, Mumbai',
    retrieveFrom: 'Parking Spot A-24',
    assignedAt: '2:30 PM'
  };

  const startRetrieval = () => {
    setCurrentStep('retrieving');
    setProgress(33);
    
    setTimeout(() => {
      setCurrentStep('on-way');
      setProgress(66);
    }, 2000);
    
    setTimeout(() => {
      setCurrentStep('arriving');
      setProgress(100);
    }, 4000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center gap-4">
          <Link href="/driver">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Vehicle Retrieval</h1>
        </div>

        <div className="px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="text-sm text-gray-500 mb-3">Current Assignment</h2>
          
          {currentStep === 'request' && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{assignment?.vehicle}</h3>
                    <p className="text-indigo-100">{assignment?.plateNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep !== 'request' && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {currentStep === 'retrieving' && 'Retrieving Vehicle...'}
                  {currentStep === 'on-way' && 'Car on the Way'}
                  {currentStep === 'arriving' && 'Car Arriving'}
                </h3>
                <p className="text-sm text-gray-600">
                  {assignment?.vehicle}
                </p>
                <p className="text-sm text-gray-500">{assignment?.plateNumber}</p>
              </div>

              <div className="mb-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                currentStep !== 'request' ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {currentStep !== 'request' ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${currentStep !== 'request' ? 'text-green-600' : 'text-gray-900'}`}>
                  Request Received
                </h4>
                <p className="text-sm text-gray-500">Valet has been notified</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                progress >= 33 ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {progress >= 33 ? (
                  currentStep === 'retrieving' ? (
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${progress >= 33 ? 'text-green-600' : 'text-gray-400'}`}>
                  Car on the Way
                </h4>
                <p className="text-sm text-gray-500">Vehicle is being brought</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                progress >= 100 ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {progress >= 100 ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                  Car Arriving
                </h4>
                <p className="text-sm text-gray-500">Ready for pickup</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Parking Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Customer</span>
                <span className="text-gray-900">{assignment?.customer}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Location</span>
              </div>
              <div className="ml-6">
                <p className="font-semibold text-gray-900">{assignment?.location}</p>
                <p className="text-xs text-gray-500">{assignment?.address}</p>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Retrieve from</span>
              </div>
              <div className="ml-6">
                <p className="font-semibold text-gray-900">{assignment?.retrieveFrom}</p>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Assigned at</span>
                <span className="text-gray-900">{assignment?.assignedAt}</span>
              </div>
            </div>
          </div>
        </div>

        {currentStep === 'request' ? (
          <button
            onClick={startRetrieval}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold"
          >
            Start Retrieval
          </button>
        ) : progress >= 100 ? (
          <Link href="/driver">
            <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold">
              Complete Retrieval
            </button>
          </Link>
        ) : null}
        </div>
      </div>
    </div>
  );
}
