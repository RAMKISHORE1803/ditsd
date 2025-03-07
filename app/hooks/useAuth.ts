"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AuthUser } from '@/types/index';
import { getSession, getUserProfile, signOut } from '../services/api';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication and load user data
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          // If no session, redirect to login
          router.push('/admin/login');
          return;
        }
        
        // Get user profile with role
        const { data: profile, error: profileError } = await getUserProfile(session.user.id);
        
        if (profileError) {
          console.error('Profile error:', profileError);
          toast.error('Failed to load user profile. Please log in again.');
          // Sign out and redirect to login if no profile
          await signOut();
          router.push('/admin/login');
          return;
        }
        
        if (!profile) {
          console.error('No user profile found');
          toast.error('User profile not found. Please contact an administrator.');
          // Sign out and redirect to login if no profile
          await signOut();
          router.push('/admin/login');
          return;
        }
        
        // Set authenticated user
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile.role,
          name: profile.name || session.user.email || 'User'
        });
        
        toast.success(`Welcome, ${profile.name || session.user.email}!`);
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('Authentication error. Please log in again.');
        // Redirect to login on error
        router.push('/admin/login');
      }
    };
    
    checkUser();
  }, [router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.info('You have been signed out.');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
    }
  };

  return {
    user,
    loading,
    signOut: handleSignOut
  };
}