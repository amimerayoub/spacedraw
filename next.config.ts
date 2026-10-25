import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Marketing canonicals/sitemaps use trailing-slash locale URLs (/fr/), so keep
  // the whole app on trailing slashes to avoid a canonical vs. live-URL mismatch.
  trailingSlash: true,
  // Serve the static multilingual marketing pages (generated into /public by
  // scripts/build-seo.mjs) at clean URLs. Root "/" mirrors /en-us/ content.
  async rewrites() {
    const locales = ['en-us', 'en-gb', 'fr', 'es', 'de', 'ar', 'pt-br', 'ru'];
    const beforeFiles: Array<{source: string; destination: string}> = [
      {source: '/', destination: '/index.html'},
    ];
    for (const l of locales) {
      beforeFiles.push({source: `/${l}`, destination: `/${l}/index.html`});
      beforeFiles.push({source: `/${l}/`, destination: `/${l}/index.html`});
    }
    return {beforeFiles, afterFiles: [], fallback: []};
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
