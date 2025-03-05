'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeaderAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      
      // Set up auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return <div className="h-8 w-20 bg-foreground/5 animate-pulse rounded"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="hover:text-opacity-70 transition-all"
        >
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="py-2 px-4 rounded-lg font-medium border border-foreground/20 hover:bg-foreground/5 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="py-2 px-4 rounded-lg font-medium border border-foreground/20 hover:bg-foreground/5 transition-colors"
      >
        Login
      </Link>
      <Link 
        href="/sign-up" 
        className="py-2 px-4 rounded-lg font-medium"
        style={{ backgroundColor: 'hsl(var(--uganda-gold))', color: 'white' }}
      >
        Sign Up
      </Link>
    </div>
  );
}