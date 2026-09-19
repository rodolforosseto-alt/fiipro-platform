import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   allowedDevOrigins: [
     "192.168.68.105",
  "192.168.68.0/24"
  ]
};

export default nextConfig;
