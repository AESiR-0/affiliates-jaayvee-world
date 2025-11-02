import type { NextConfig } from "next";
// @ts-ignore - next-pwa doesn't have proper type definitions compatible with Next.js 15
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

// @ts-ignore - Type mismatch between next-pwa types and Next.js 15 types
export default pwaConfig(nextConfig);
