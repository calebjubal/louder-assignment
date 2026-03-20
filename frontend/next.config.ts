import type { NextConfig } from "next";

const backendBaseUrl =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://louder-backend.vercel.app").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
