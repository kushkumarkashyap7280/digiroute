import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private share links: never cache, never index, never leak the URL as a referrer.
  async headers() {
    return [
      {
        source: "/c/:token*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      // Cloudinary — for uploaded entrance photos
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
