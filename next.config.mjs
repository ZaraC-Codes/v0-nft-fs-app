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

  // Generate unique build IDs to prevent cache issues
  generateBuildId: async () => {
    // Use git commit hash + timestamp for guaranteed unique builds
    const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ||
                     process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
                     'local';
    const timestamp = Date.now();
    return `${commitSha.substring(0, 7)}-${timestamp}`;
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