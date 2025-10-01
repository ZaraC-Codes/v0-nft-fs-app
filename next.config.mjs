/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  webpack: (config, { isServer, dev }) => {
    // Ignore pino-pretty in browser builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino-pretty': false,
      }
    }

    // Ignore missing optional dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    }

    // Critical: Set parallelism to 1 to prevent worker crashes
    config.parallelism = 1

    // Disable cache in development to prevent corruption
    if (dev) {
      config.cache = false
    }

    // Reduce memory pressure by limiting chunks
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      }
    }

    return config
  },
}

export default nextConfig