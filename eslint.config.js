import { defineConfig } from 'eslint-define-config';
export default defineConfig({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    env: {
      node: true,
      es6: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['@typescript-eslint'],
    rules: {
      // Add backend-specific rules here
    },
  });