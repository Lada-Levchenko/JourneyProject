// apps/mobile/eslint.config.js
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import path from "path";
import baseConfig from "../../eslint.config.js";

export default defineConfig([
  ...baseConfig, // your root lint rules (shared across web/api)
  ...expoConfig, // adds Expo-specific linting rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: path.resolve("./tsconfig.json"),
      },
    },
    ignores: ["dist/**", "build/**", ".expo/**", "node_modules/**"],
  },
]);
