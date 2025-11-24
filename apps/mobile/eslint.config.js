// apps/mobile/eslint.config.js
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import path from "path";
// Using path.resolve("./tsconfig.json") in an ESM module resolves relative to the process's current working directory, not the config file's directory. This will fail when ESLint is run from a parent directory.
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
import baseConfig from "../../eslint.config.js";

export default defineConfig([
  ...baseConfig, // your root lint rules (shared across web/api)
  ...expoConfig, // adds Expo-specific linting rules
  // In ESLint flat config, ignores should not be combined with files or other configuration properties in the same object. This creates ambiguity in the configuration structure.
  //{ ignores: ["dist/**", "build/**", ".expo/**", "node_modules/**"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: path.resolve("./tsconfig.json"),
        // project: path.resolve(__dirname, "./tsconfig.json"),
      },
    },
    ignores: ["dist/**", "build/**", ".expo/**", "node_modules/**"],
  },
]);
