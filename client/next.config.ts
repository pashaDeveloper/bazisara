import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/magazine/:segments*", destination: "/magzine/:segments*", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "s3.ir-tbz-sh1.arvanstorage.ir",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
