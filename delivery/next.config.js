/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "maps.googleapis.com" }] },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/:path*` },
    ];
  },
};
module.exports = nextConfig;
