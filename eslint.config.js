import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["skills/**", "dist/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
        module: "readonly",
        __dirname: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        setTimeout: "readonly",
        fetch: "readonly",
        FormData: "readonly",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      "react/prop-types": "off",
      "no-unused-vars": "warn",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "react/react-in-jsx-scope": "off",
    },
  },
];
