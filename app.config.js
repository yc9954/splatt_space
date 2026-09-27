// Dynamic Expo config. app.json holds the static manifest; this file only
// mirrors the EXPO_PUBLIC_* variables into `extra` so they are also
// reachable through expo-constants (see src/lib/config.ts).
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    kiriApiKey: process.env.EXPO_PUBLIC_KIRI_API_KEY,
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    lumaApiKey: process.env.EXPO_PUBLIC_LUMA_API_KEY,
    demoMode: process.env.EXPO_PUBLIC_DEMO_MODE,
  },
});
