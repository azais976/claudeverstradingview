import type { NextConfig } from "next";

const isMobile = process.env.NEXT_PUBLIC_TARGET === "mobile";

const nextConfig: NextConfig = {
  // Static export for Capacitor mobile builds
  ...(isMobile ? { output: "export", trailingSlash: true } : {}),

  images: {
    // next/image doesn't work in static export; disable optimization for mobile
    unoptimized: isMobile,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
