module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  overrides: [],
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 1,
    "@typescript-eslint/unbound-method": 0,
    '@typescript-eslint/require-await': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-misused-promises': [
      2,
      {
        checksVoidReturn: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: '^_',
      },
    ],
  },
};