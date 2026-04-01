import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ["@procore/core-react", "@procore/globalization-toolkit"],
};

export default nextConfig;
