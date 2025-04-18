import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts}"], 
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-expressions": "off", // Explicitly override after recommended rules
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/live/**", "**/.eslintrc.js"],
  }
]);