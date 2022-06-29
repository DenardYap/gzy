const { i18n } = require("./next-i18next.config");
// const { nextI18NextRewrites } = require('next-i18next/rewrites');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack5: false,
};

module.exports = {
  nextConfig,
  i18n,
};
