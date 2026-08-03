/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
      {
        // Self-hosted Appwrite
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
