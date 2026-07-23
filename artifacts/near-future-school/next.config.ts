import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Video / audio files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mov|avi|wav|mp3)$/,
      type: "asset/resource",
      generator: { filename: "static/media/[name].[hash][ext]" },
    });
    return config;
  },
};

export default nextConfig;
