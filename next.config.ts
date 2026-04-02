import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ["@procore/core-react", "@procore/core-icons", "@procore/globalization-toolkit"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          self: "globalThis",
        })
      );
    }
    return config;
  },
};

export default nextConfig;
