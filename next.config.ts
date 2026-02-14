import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      // Redirect old Vercel domain to custom domain
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'recv-ai.vercel.app',
          },
        ],
        destination: 'https://recv-ai.me/:path*',
        permanent: true,
      },
      // Handle www subdomain redirect (already handled by Vercel DNS, but as backup)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.recv-ai.me',
          },
        ],
        destination: 'https://recv-ai.me/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

