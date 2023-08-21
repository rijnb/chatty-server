const {basePath, output} = require("./config")
const {i18n} = require("./next-i18next.config")

/** @type {import("next").NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  distDir: "build",
  output,
  images: {
    unoptimized: true
  },
  basePath,
  pageExtensions: ["page.tsx", "page.ts", "api.tsx", "api.ts", "infra.ts"],

  webpack(config, {isServer, dev}) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true
    }

    return config
  }
}

module.exports = nextConfig
