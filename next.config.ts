import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://brewguard.onrender.com/api/:path*", // Fixed path to include /api/
      },
    ]
  },
}

export default nextConfig
