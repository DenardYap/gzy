const { i18n } = require("./next-i18next.config");
// const { nextI18NextRewrites } = require('next-i18next/rewrites');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack5: false,
};

module.exports = {
  images: {
    minimumCacheTTL: 0,
    domains: [
      process.env.NEXT_PUBLIC_cloudFrontURL,
      "lh3.googleusercontent.com",
    ],
  },
  env: {
    mongoURI: process.env.mongoURI,
    mongoCART: process.env.mongoCART,
    mongoUSER: process.env.mongoUSER,
    mongoPRODUCT: process.env.mongoPRODUCT,
    mongoDatabaseName: process.env.mongoDatabaseName,
    databaseUsername: process.env.databaseUsername,
    databasePassword: process.env.databasePassword,
  },
  nextConfig,
  i18n,
};
