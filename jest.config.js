const nextJest = require("next/jest")
const {pathsToModuleNameMapper} = require("ts-jest")
const {compilerOptions} = require("./tsconfig")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./"
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  automock: false,
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: "<rootDir>/"})
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
