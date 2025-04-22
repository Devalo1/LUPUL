module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime"
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "node_modules"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "@typescript-eslint"],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // Permitem console în fișierele specificate și în mediile de dezvoltare/test
    "no-console": ["warn", { 
      allow: ["warn", "error", "info"],
    }],
    // Permitem @ts-ignore în cazuri specifice
    "@typescript-eslint/ban-ts-comment": "warn",
    // Setăm regulile pentru tipul any
    "@typescript-eslint/no-explicit-any": "warn",
    // React Refresh
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true }
    ],
    // React
    "react/prop-types": "off",
    "react/display-name": "off"
  },
  overrides: [
    {
      // Dezactivăm avertizările console.log pentru fișierele utilitare și de dezvoltare
      files: [
        "**/utils/**/*.{ts,tsx,js,jsx}",
        "**/services/**/*.{ts,tsx,js,jsx}", 
        "**/hooks/**/*.{ts,tsx,js,jsx}",
        "**/config/**/*.{ts,tsx,js,jsx}",
        "**/debug/**/*.{ts,tsx,js,jsx}",
        "**/*.dev.{ts,tsx,js,jsx}"
      ],
      rules: {
        "no-console": "off"
      }
    },
    {
      // Dezactivăm avertizările any pentru fișiere specifice
      files: [
        "**/types/mongoose-delete/**/*.{ts,tsx}",
        "**/*.d.ts"
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off"
      }
    },
    {
      // Dezactivăm regula react-refresh/only-export-components pentru utilitare
      files: [
        "**/utils/lazyLoad.tsx",
      ],
      rules: {
        "react-refresh/only-export-components": "off"
      }
    }
  ]
};