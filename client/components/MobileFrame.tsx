'use client';

import { usePathname } from 'next/navigation';

type MobileFrameProps = {
  children: React.ReactNode;
};

export default function MobileFrame({ children }: MobileFrameProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-[420px] h-[90vh] max-h-[850px] bg-black rounded-[50px] p-3.5 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20"></div>
        
        <div className="relative w-full h-full bg-white rounded-[42px] overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-11 bg-transparent z-10 px-6 flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-900">9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M.2 10.5l3 3.5a1 1 0 001.5 0l3-3.5a1 1 0 00-1.5-1.3L5 11V1a1 1 0 00-2 0v10L1.7 9.2a1 1 0 00-1.5 1.3zm16.3-1.3L15 7.5V17a1 1 0 002 0V7.5l1.5 1.7a1 1 0 001.5-1.3l-3-3.5a1 1 0 00-1.5 0l-3 3.5a1 1 0 001.5 1.3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
        
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
      </div>
    </div>
  );
}
