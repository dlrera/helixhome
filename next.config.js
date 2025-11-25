import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during builds (ESLint 9.x flat config incompatibility)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // PERFORMANCE OPTIMIZATION: Task 7a
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', 'date-fns'],
  },

  // Production optimizations
  reactStrictMode: true,

  // Compress output
  compress: true,

  // Output standalone for better deployment
  output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,
}

export default withBundleAnalyzer(nextConfig)
