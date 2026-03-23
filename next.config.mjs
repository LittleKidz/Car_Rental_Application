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
    return [
      {
        source: "/api/providers/:path*",
        destination: process.env.BACKEND_URL + "/api/providers/:path*",
      },
      {
        source: "/api/cars/:path*",
        destination: process.env.BACKEND_URL + "/api/cars/:path*",
      },
      {
        source: "/api/rentals/:path*",
        destination: process.env.BACKEND_URL + "/api/rentals/:path*",
      },
    ];
  },
};

export default nextConfig;
