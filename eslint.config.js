import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["**/{.next,node_modules,dist,build,docs}/**"],
  },
  {
    plugins: { prettier },
    rules: {
      "prettier/prettier": ["error"],
    },
    //ignores: ["**/dist/**", "**/node_modules/**"],
  },
];
