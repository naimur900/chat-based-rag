import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root; a stray package-lock.json in the parent dir
    // otherwise makes Next.js infer the wrong root.
    root: __dirname,
  },
};

export default nextConfig;
