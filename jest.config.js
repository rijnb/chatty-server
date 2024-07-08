/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
/** @type {import("jest").Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  automock: false,
  clearMocks: true,
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
