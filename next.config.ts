import type { NextConfig } from "next";
import { normalizeBasePath } from './src/lib/sitePath.mjs';

const deploymentBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? '');

const nextConfig: NextConfig = {
  output: 'export',
  basePath: deploymentBasePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.bib$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
