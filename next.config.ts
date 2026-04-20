import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect old Vercel domain to custom domain (EXCLUDE API routes and Next.js internals)
      {
        source: '/((?!api|_next|static|favicon.ico).*)',
        has: [
          {
            type: 'host',
            value: 'recv-ai.vercel.app',
          },
        ],
        destination: 'https://recv-ai.me/:path*',
        permanent: true,
      },
      // Handle www subdomain redirect (EXCLUDE API routes and Next.js internals)
      {
        source: '/((?!api|_next|static|favicon.ico).*)',
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
