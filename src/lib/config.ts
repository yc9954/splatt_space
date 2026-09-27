import Constants from 'expo-constants';

/**
 * Runtime configuration.
 *
 * Every value is read from an EXPO_PUBLIC_* environment variable first
 * (inlined by Expo at build time) and falls back to `expo.extra` in
 * app.config.js, which mirrors the same variables. Nothing here is
 * hardcoded; see .env.example for the full list.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

function pick(envValue: string | undefined, extraValue: string | undefined): string | undefined {
  const value = envValue ?? extraValue;
  return value && value.trim() !== '' ? value.trim() : undefined;
}

export const config = {
  supabaseUrl: pick(process.env.EXPO_PUBLIC_SUPABASE_URL, extra.supabaseUrl),
  supabaseAnonKey: pick(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, extra.supabaseAnonKey),
  kiriApiKey: pick(process.env.EXPO_PUBLIC_KIRI_API_KEY, extra.kiriApiKey),
  openaiApiKey: pick(process.env.EXPO_PUBLIC_OPENAI_API_KEY, extra.openaiApiKey),
  lumaApiKey: pick(process.env.EXPO_PUBLIC_LUMA_API_KEY, extra.lumaApiKey),
  demoModeFlag: pick(process.env.EXPO_PUBLIC_DEMO_MODE, extra.demoMode),
} as const;

/** True when both Supabase values are present. */
export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);

/**
 * Demo mode serves bundled sample scenes from an in-memory backend so the
 * app can be explored (and screenshotted) without any credentials.
 * It is on when EXPO_PUBLIC_DEMO_MODE=true, or automatically when Supabase
 * is not configured.
 */
export const isDemoMode = config.demoModeFlag === 'true' || !isSupabaseConfigured;

export const KIRI_API_URL = 'https://api.kiriengine.app/api/v1';
export const LUMA_API_URL = 'https://api.lumalabs.ai/v1';
export const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
