
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      "i.postimg.cc",
      "localhost:8080",
      "192.168.1.126",
      "sales-box-photos.s3-eu-central-1.amazonaws.com",
      "yourcdn.com",
      "fitwin-powerpro.com",
      "d3og57k1dk4307.cloudfront.net",
      "localhost",
    ],
  },
};

module.exports = nextConfig;
