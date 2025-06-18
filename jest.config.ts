import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"],
  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Transform files - only use ts-jest to avoid babel conflicts
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },

  // Module name mapping for CSS modules and static assets
  moduleNameMapper: {
    // CSS modules
    "\\.module\\.css$": "identity-obj-proxy",
    "\\.css$": "identity-obj-proxy",

    // Static assets
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "jest-transform-stub",
  },

  // Test match patterns - only include .jest.test files for Jest
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.jest.(ts|tsx|js)",
    "<rootDir>/src/**/*.jest.test.(ts|tsx|js)",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/build/",
  ],
  // Transform ignore patterns
  transformIgnorePatterns: [
    "node_modules/(?!(firebase|@firebase|@testing-library|chart.js|react-chartjs-2)/)",
    "\\.js$", // Ignore plain JS files to avoid babel-jest requirement
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: false,
};

export default config;
