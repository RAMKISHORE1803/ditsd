'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MapExitButton from '@/components/MapExitButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMapRoute = pathname === '/map';

  return (
    <>
      {isMapRoute ? (
        <MapExitButton />
      ) : (
        <Navbar />
      )}
      
      <div className={`w-full ${isMapRoute ? '' : 'pt-16'}`}>
        {children}
      </div>
      
      {!isMapRoute && <Footer />}
    </>
  );
}