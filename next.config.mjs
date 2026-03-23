/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.imagin.studio",
      },
    ],
  },
  env: {
    FRONTEND_URL: process.env.FRONTEND_URL,
    BACKEND_URL: process.env.BACKEND_URL,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL || "http://localhost:5000";
    return [
      {
        source: "/api/providers/:path*",
        destination: `${backend}/api/providers/:path*`,
      },
      {
        source: "/api/cars/:path*",
        destination: `${backend}/api/cars/:path*`,
      },
      {
        source: "/api/rentals/:path*",
        destination: `${backend}/api/rentals/:path*`,
      },
    ];
  },
};

export default nextConfig;
