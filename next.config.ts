import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Disable TypeScript build errors for now
    typescript: {
        ignoreBuildErrors: false,
    },
    // Image optimization
    images: {
        domains: [],
    },
    // Experimental features
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
};

export default nextConfig;
