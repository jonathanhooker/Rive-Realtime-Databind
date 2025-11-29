import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: __dirname, // forces this directory to be the root
  },
};

export default nextConfig;
