import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "**/{.next,node_modules,dist,build,docs}/**",
      "**/jest.config.js",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  //...tseslint.configs.recommendedTypeChecked,

  {
    // languageOptions: {
    //   parserOptions: {
    //     projectService: true,
    //     tsconfigRootDir: import.meta.dirname,
    //   },
    // },
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },

  // Не включаем type-aware linting для eslint config файлов
  // {
  //   files: [
  //     "eslint.config.js",
  //     "apps/*/eslint.config.js",
  //     "apps/*/eslint.config.mjs",
  //     "packages/*/eslint.config.js",
  //     "packages/*/eslint.config.mjs",
  //   ],
  //   extends: [tseslint.configs.disableTypeChecked],
  // },

  {
    files: ["apps/api/src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/require-await": "off",
    },
  },

  {
    files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },

  {
    files: ["packages/types/src/**/*.ts", "packages/types/src/**/*.d.ts"],
    rules: {},
  },

  {
    files: ["packages/ui/**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  {
    files: ["packages/utils/**/*.{ts,tsx}"],
    rules: {},
  },
];
