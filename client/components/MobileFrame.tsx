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
          
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
        
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
      </div>
    </div>
  );
}
