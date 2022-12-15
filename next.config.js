/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["picsum.photos"],
  },
  rewrites: async () => {
    return [
      {
        source: "/spaces/template-1",
        destination: "/spaces/template-1/index.html",
      },
    ];
  },
};

module.exports = nextConfig;
