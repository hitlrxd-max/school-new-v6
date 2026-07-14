import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // @assets alias → attached_assets directory
    config.resolve.alias = {
      ...config.resolve.alias,
      "@assets": path.resolve(__dirname, "../../attached_assets"),
    };

    // Images from attached_assets: return URL strings (like Vite)
    // Must come BEFORE Next.js default image rules
    config.module.rules.unshift({
      test: /\.(png|jpe?g|gif|svg|webp|ico|bmp|tiff|avif)$/,
      include: [path.resolve(__dirname, "../../attached_assets")],
      type: "asset/resource",
      generator: { filename: "static/media/[name].[hash][ext]" },
    });

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
