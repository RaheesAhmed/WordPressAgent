import { useState, useEffect } from 'react';
import { authService } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Function to sync user with our custom users table
const syncUserToDatabase = async (user: User) => {
  try {
    console.log('Syncing user to database:', user.id, user.email);
    
    const response = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar: user.user_metadata?.avatar_url,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to sync user to database:', response.status, errorText);
      return false;
    }
    
    const result = await response.json();
    console.log('User sync successful:', result.user?.email);
    return true;
  } catch (error) {
    console.error('Error syncing user:', error);
    return false;
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    // Get initial session and sync user
    const getInitialSession = async () => {
      try {
        const { session, error } = await authService.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        // If user exists, sync to our database
        if (session?.user) {
          await syncUserToDatabase(session.user);
        }
        
        if (isMounted) {
          setAuthState({
            user: session?.user ?? null,
            session: session,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (isMounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with better error handling
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session?.user);
        
        try {
          // If user signs in or token refreshes, sync to our database
          if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            await syncUserToDatabase(session.user);
          }
          
          if (isMounted) {
            setAuthState({
              user: session?.user ?? null,
              session: session,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          if (isMounted) {
            setAuthState({
              user: session?.user ?? null,
              session: session,
              loading: false,
            });
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    await authService.signOut();
  };

  return {
    ...authState,
    signOut,
  };
};