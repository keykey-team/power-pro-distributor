const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.126',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sales-box-photos.s3-eu-central-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yourcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fitwin-powerpro.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd3og57k1dk4307.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;