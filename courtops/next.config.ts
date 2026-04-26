import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.mercadolibre.com',
      },
      {
        protocol: 'https',
        hostname: '*.meli.com',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.bing.net',
      },
      {
        protocol: 'https',
        hostname: 'courtops.net',
      },
      {
        protocol: 'https',
        hostname: '*.courtops.net',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
};

export default withSentryConfig(withPWA(nextConfig), {
  // Sentry org and project (set via env vars or here)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps for better stack traces
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Suppress noisy build logs
  silent: !process.env.CI,

  // Disable Sentry telemetry
  telemetry: false,
});
