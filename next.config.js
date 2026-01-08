/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
    ],
  },
  serverExternalPackages: ['shiki'],
  experimental: {
    // Fix for server actions in standalone build
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Suppress fetch warnings in Edge Runtime
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = nextConfig;
