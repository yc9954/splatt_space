import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

import { isDemoMode } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { DemoAPI } from '@/services/demo';
import { StorageService } from '@/services/storage';
import { SupabaseAPI } from '@/services/supabase-api';
import type { LoginRequest, RegisterRequest, User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True when running against the bundled in-memory backend. */
  isDemo: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Build a usable User from the Supabase auth record when no profile row exists yet. */
function userFromSupabase(supabaseUser: SupabaseUser): User {
  const meta = supabaseUser.user_metadata ?? {};
  const displayName =
    meta.full_name || meta.name || meta.username || supabaseUser.email?.split('@')[0] || 'user';
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: displayName,
    profileImage: meta.avatar_url || meta.picture,
    bio: meta.bio || '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = async (session: Session, profile: User) => {
    await StorageService.saveAuthToken(session.access_token);
    await StorageService.saveUserData(profile);
    setUser(profile);
  };

  const loadProfileForSession = async (session: Session) => {
    try {
      const profile = await SupabaseAPI.getProfile(session.user.id, session.user);
      await persistSession(session, profile);
    } catch (error) {
      console.warn('Profile load failed, using auth metadata instead:', error);
      await persistSession(session, userFromSupabase(session.user));
    }
  };

  // ---------- Demo mode: everything is local ----------
  const checkAuthDemo = async () => {
    try {
      const stored = await StorageService.getUserData();
      if (stored) {
        DemoAPI.setCurrentUser(stored);
        setUser(stored);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Supabase mode ----------
  const checkAuthSupabase = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) console.warn('Session check error:', error.message);

      if (session?.user) {
        await loadProfileForSession(session);
      } else {
        // Clear any orphaned local data from a previous session.
        const token = await StorageService.getAuthToken();
        const userData = await StorageService.getUserData();
        if (token || userData) await StorageService.clearAll();
      }
    } catch (error) {
      console.warn('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      checkAuthDemo();
      return;
    }

    checkAuthSupabase();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfileForSession(session);
      } else if (event === 'SIGNED_OUT') {
        await StorageService.clearAll();
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (data: LoginRequest) => {
    if (isDemoMode) {
      const profile = await DemoAPI.signInWithEmail(data.email, data.password);
      await StorageService.saveAuthToken('demo');
      await StorageService.saveUserData(profile);
      setUser(profile);
      return;
    }
    // The auth listener loads the profile once Supabase confirms the session.
    await SupabaseAPI.signInWithEmail(data.email, data.password);
  };

  const register = async (data: RegisterRequest) => {
    if (isDemoMode) {
      const profile = await DemoAPI.signUpWithEmail(data.email, data.password, data.username);
      await StorageService.saveAuthToken('demo');
      await StorageService.saveUserData(profile);
      setUser(profile);
      return;
    }
    await SupabaseAPI.signUpWithEmail(data.email, data.password, data.username);
  };

  const logout = async () => {
    setUser(null);
    await StorageService.clearAll();
    if (isDemoMode) {
      await DemoAPI.signOut();
      return;
    }
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.warn('Logout error:', error);
    }
  };

  const refreshAuth = async () => {
    if (isDemoMode) await checkAuthDemo();
    else await checkAuthSupabase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDemo: isDemoMode,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
