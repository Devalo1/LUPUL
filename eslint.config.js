import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      ".netlify/**/*",
      "dist/**/*", 
      "build/**/*",
      "node_modules/**/*",
      "**/*.min.js",
      "**/functions-serve/**/*"
    ]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      "react-refresh": reactRefreshPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react-refresh/only-export-components": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      quotes: ["error", "double", { allowTemplateLiterals: true }],
    },
  },
  // Disable console warnings for components and pages during development
  {
    files: [
      "**/components/**/*",
      "**/pages/**/*",
      "**/main.tsx",
    ],
    rules: {
      "no-console": "off",
    },
  },
  // Disable both console and any type warnings for specific areas
  {
    files: [
      "**/utils/**/*",
      "**/services/**/*",
      "**/hooks/use*.ts",
      "**/contexts/**/*",
      "**/store/**/*",
      "**/models/**/*",
      "**/types/**/*",
      "**/middleware/**/*",
      "types/**/*",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Disable any type warnings in pages for development
  {
    files: ["**/pages/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["functions/**/*.js", "functions/**/*.ts"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];