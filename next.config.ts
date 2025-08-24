import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  
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
