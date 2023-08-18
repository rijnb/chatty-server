const nextJest = require("next/jest")
const {pathsToModuleNameMapper} = require("ts-jest")
const {compilerOptions} = require("./tsconfig")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./"
})

// list to add ESM to ignore
const esModules = [
  "ccount",
  "character-entities",
  "comma-separated-tokens",
  "decode-named-character-reference",
  "escape-string-regexp",
  "hastscript",
  "hast-util-(.*)",
  "longest-streak",
  "markdown-table",
  "mdast-util-(.*)",
  "micromark-(.*)",
  "property-information",
  "rehype-mathjax",
  "remark-gfm",
  "remark-math",
  "space-separated-tokens",
  "unist-util-(.*)",
  "web-namespaces"
].join(`|`)

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  automock: false,
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {prefix: "<rootDir>/"}),
    "react-markdown": "<rootDir>/node_modules/react-markdown/react-markdown.min.js"
  }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)()
  config.transformIgnorePatterns[0] = `/node_modules/(?!${esModules})`
  return config
}
