import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const cspProd = [
  "default-src 'self'",
  "img-src 'self' res.cloudinary.com data: blob:",
  "media-src 'self' data: blob:",
  // Next.js requires 'unsafe-inline' and 'unsafe-eval' for Turbopack in production
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:", // Added wss: for websocket connections
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const cspDev = [
  "default-src 'self'",
  "img-src 'self' res.cloudinary.com data: blob:",
  "media-src 'self' data: blob:",  
  // Dev needs inline/eval and websocket for HMR and Turbopack runtime
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' http: https: ws:",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: isProd ? cspProd : cspDev },
];

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
