import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
  },
  async redirects() {
    return [
      // The facility service page merged into /partners. 301 (not Next's default 308) as briefed.
      { source: "/services/facility-and-discharge-partners", destination: "/partners", statusCode: 301 },
    ];
  },
};

export default nextConfig;
