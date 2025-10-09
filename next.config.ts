import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  
  // Allow VS Code Simple Browser and other embeds
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lottie-react'],
  },
};

export default nextConfig;
