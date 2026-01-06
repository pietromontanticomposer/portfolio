import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '4glkq64bdlmmple5.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui0he7mtsmc0vwcb.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize image caching - 1 year cache for immutable images
    minimumCacheTTL: 31536000,
    // Prefer modern formats
    formats: ['image/avif', 'image/webp'],
    // Increase timeout for remote images (default is 15s, increase to 30s)
    dangerouslyAllowSVG: false,
    // Don't optimize images in development to avoid timeout issues
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Cache headers for static assets
  async headers() {
    return [
      {
        // Static uploads (images, etc)
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // HLS video segments
        source: '/hls/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Fonts
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Placeholders
        source: '/placeholders/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
