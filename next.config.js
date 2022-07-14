/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    outputStandalone: true
  },
  env: {}
};

module.exports = nextConfig;
