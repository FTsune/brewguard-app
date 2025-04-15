import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://brewguard.onrender.com/api/:path*",
      },
    ]
  },
}

export default nextConfig
