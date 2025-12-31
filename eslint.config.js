import js from "@eslint/js";
import globals from "globals";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import-x";

export default defineConfig([
  globalIgnores(["dist", "wrangler-types.d.ts", "**/generated/*.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooksPlugin.configs.flat.recommended,
      reactRefreshPlugin.configs.vite,
      importPlugin.flatConfigs.typescript,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // we're following a simplified version of FSD
      // app -> features -> shared
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            // app can import anything
            // features can not import from app
            {
              target: "./src/features",
              from: ["./src/app"],
            },
            // shared can not import from ...anything, really
            {
              target: "./src/shared",
              from: ["./src/app", "./src/features"],
            },
          ],
        },
      ],
    },
  },
]);
