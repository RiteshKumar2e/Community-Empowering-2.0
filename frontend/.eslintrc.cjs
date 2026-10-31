// ESLint 8 config (the repo had eslint + plugins installed but no config).
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'dist-prerender', 'node_modules'],
  rules: {
    // The project doesn't use PropTypes.
    'react/prop-types': 'off',
    // Allow intentionally unused args/vars when prefixed with _.
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react/no-unescaped-entities': 'warn',
  },
}
