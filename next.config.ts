import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const cspProd = [
  "default-src 'self'",
  "img-src 'self' res.cloudinary.com data: blob:",
  "media-src 'self' data: blob:",
  // In production we keep script-src strict; if you introduce inline scripts, move to a nonce-based CSP
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
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
