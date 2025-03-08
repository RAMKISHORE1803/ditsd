"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client with error handling
const getSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials. Make sure environment variables are set correctly.');
    // Return a mock client in development to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      return createMockClient();
    }
    throw new Error('Supabase configuration is missing');
  }

  // Create a singleton instance of the Supabase client
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    if (process.env.NODE_ENV === 'development') {
      return createMockClient();
    }
    throw error;
  }
};

// Mock client for development when Supabase credentials are missing
function createMockClient(): SupabaseClient {
  console.warn('Using mock Supabase client - data operations will return empty results');
  
  // This is a simplified mock that implements the SupabaseClient interface
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: null, error: null }) }),
        order: () => ({ data: [], error: null }),
        limit: () => ({ data: [], error: null }),
        range: () => ({ order: () => ({ data: [], error: null }) })
      }),
      insert: () => ({ error: null }),
      update: () => ({ eq: () => ({ error: null }) }),
      delete: () => ({ eq: () => ({ error: null }) })
    }),
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    functions: {
      invoke: async () => ({ data: null, error: null })
    }
  } as unknown as SupabaseClient; // Type assertion for the mock
};

// Export the Supabase client
let supabase: SupabaseClient;
try {
  supabase = getSupabaseClient();
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // In production, we'll rethrow to prevent the app from loading with a broken client
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
  // In development, use the mock client
  supabase = createMockClient();
}

export { supabase };