/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile packages for better compatibility with Three.js
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  // Allow images from external sources
  images: {
    domains: ["i.postimg.cc", "localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: "ZK Identity for the Unbanked",
    NEXT_PUBLIC_APP_DESCRIPTION:
      "Privacy-preserving identity for financial inclusion",
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Webpack configuration for Three.js
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });

    return config;
  },
};

module.exports = nextConfig;
