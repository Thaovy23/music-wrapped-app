import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR websocket connections from loopback and LAN origins during development.
  // Next.js 16 expects full "scheme://host:port" strings here.
  allowedDevOrigins: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://192.168.2.7:3000",
  ],
};

export default nextConfig;
