import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images from Unsplash (used for avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
