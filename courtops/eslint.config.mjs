import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",

    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent tooling & skills — not application code
    ".agent/**",
    // Generated PWA service workers & minified bundles
    "public/**",
    // Utility/debug scripts (CommonJS, not TS/ESM app code)
    "scripts/**",
    "*.js",
    "prisma/seed*.ts",
    "debug_*.ts",
    "check_*.js",
    "clean_*.js",
    "diagnose.js",
    "fix_*.js",
    "output_*.txt",
  ]),
]);

export default eslintConfig;
