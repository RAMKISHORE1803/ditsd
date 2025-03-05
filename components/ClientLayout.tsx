'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check for routes that should have different layouts
  const isMapRoute = pathname === '/map';
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLoginRoute = pathname === '/login';
  
  // Determine if we should show navbar and footer
  const showNavbarAndFooter = !isMapRoute && !isAdminRoute && !isLoginRoute;
  
  return (
    <>
      {showNavbarAndFooter && <Navbar />}
      
      <div className={`w-full ${showNavbarAndFooter ? 'pt-16' : ''}`}>
        {children}
      </div>
      
      {showNavbarAndFooter && <Footer />}
    </>
  );
}