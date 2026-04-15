import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/wp-content/:path*',
        destination: 'https://dev-bluerange.pantheonsite.io/wp-content/:path*',
      },
    ];
  },
};

export default nextConfig;
