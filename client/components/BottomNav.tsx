'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type BottomNavProps = {
  role: 'user' | 'manager' | 'driver' | 'super-admin';
};

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  if (role === 'user') {
    return (
      <div className="w-full bg-white border-t border-gray-200 pb-2">
        <div className="flex justify-around items-center px-4 py-2.5">
          <Link href="/user/home" className="flex flex-col items-center gap-0.5 flex-1">
            <svg className={`w-6 h-6 ${isActive('/user/home') ? 'text-indigo-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className={`text-[10px] font-medium ${isActive('/user/home') ? 'text-indigo-600' : 'text-gray-400'}`}>Home</span>
          </Link>
          
          <Link href="/user/ticket" className="flex flex-col items-center gap-0.5 flex-1">
            <svg className={`w-6 h-6 ${isActive('/user/ticket') ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span className={`text-[10px] font-medium ${isActive('/user/ticket') ? 'text-indigo-600' : 'text-gray-400'}`}>Ticket</span>
          </Link>
          
          <Link href="/user/history" className="flex flex-col items-center gap-0.5 flex-1">
            <svg className={`w-6 h-6 ${isActive('/user/history') ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-[10px] font-medium ${isActive('/user/history') ? 'text-indigo-600' : 'text-gray-400'}`}>History</span>
          </Link>
          
          <Link href="/user/settings" className="flex flex-col items-center gap-0.5 flex-1">
            <svg className={`w-6 h-6 ${isActive('/user/settings') ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-[10px] font-medium ${isActive('/user/settings') ? 'text-indigo-600' : 'text-gray-400'}`}>Settings</span>
          </Link>
        </div>
      </div>
    );
  }
  
  return null;
}
