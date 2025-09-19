/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle path aliases for both local and Vercel deployment
    const path = require('path');
    const appPath = path.resolve(__dirname, './app');

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': appPath,
      '@/components': path.resolve(appPath, 'components'),
      '@/lib': path.resolve(appPath, 'lib'),
      '@/types': path.resolve(appPath, 'types'),
    };

    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/bigquery'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@google-cloud/**/*'],
    },
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
    BIGQUERY_DATASET: process.env.BIGQUERY_DATASET,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
};

module.exports = nextConfig;