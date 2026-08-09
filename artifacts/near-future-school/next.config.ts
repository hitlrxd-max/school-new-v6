import type { NextConfig } from "next";

// Read Supabase config at server startup time so Next.js can embed them
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const nextConfig: NextConfig = {
  // Expose all Supabase vars via next.config env (read at startup from process.env)
  // These override the webpack compile-time replacement for NEXT_PUBLIC_ vars
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    // Server-only aliases (no webpack replacement, always runtime)
    _SUPABASE_URL: supabaseUrl,
    _SUPABASE_ANON_KEY: supabaseAnonKey,
    _SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mov|avi|wav|mp3)$/,
      type: "asset/resource",
      generator: { filename: "static/media/[name].[hash][ext]" },
    });
    return config;
  },
};

export default nextConfig;
