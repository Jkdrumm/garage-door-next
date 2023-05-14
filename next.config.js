/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
  env: { MONGODB_URI: '127.0.0.1:27017/Garage', NEXTAUTH_URL: 'http://127.0.0.1' },
  webpack: config => {
    // this will override the experiments
    config.experiments = { ...config.experiments, ...{ topLevelAwait: true } };
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true
    return config;
  }
};

module.exports = nextConfig;
