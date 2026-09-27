import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import { config, isSupabaseConfigured } from './config';

/**
 * Shared Supabase client.
 *
 * When credentials are missing the app runs in demo mode and this client is
 * a harmless placeholder so imports never crash; nothing is ever sent to it.
 */
let supabase: SupabaseClient;

if (!isSupabaseConfigured) {
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
} else {
  supabase = createClient(config.supabaseUrl!, config.supabaseAnonKey!, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  });

  // Keep the session fresh while the app is in the foreground.
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export { supabase };
