import globals from "globals";
import path from "node:path";
import {fileURLToPath} from "node:url";
import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends("eslint:recommended"),
  {
    plugins: {
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      },
    },
    rules: {
      "no-cond-assign": 0,
      "no-constant-condition": 0,
      "no-sparse-arrays": 0,
      "no-unexpected-multiline": 0
    }
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    }
  }
];
