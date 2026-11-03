import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,js}'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    // domain/ must stay pure TS: no framework, no third-party, no app/widget code.
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: '^(?!\\.)', message: 'domain/ may only import relative modules.' },
            {
              group: ['**/app/**', '**/widget/**'],
              message: 'domain/ must not depend on app/widget.',
            },
          ],
        },
      ],
    },
  },
);
