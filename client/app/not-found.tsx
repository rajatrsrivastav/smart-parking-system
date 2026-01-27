'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-9xl font-bold text-indigo-600 mb-4">404</div>
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-300 text-lg mb-8">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-colors mb-4"
          >
            ← Go Back
          </button>

          <div className="mt-8 text-gray-400 text-sm">
            <p>Need help? Contact support or return to home</p>
          </div>
        </div>
      </div>
    </div>
  );
}
