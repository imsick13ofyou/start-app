import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'local-jsdoc': {
        rules: {
          'public-api': {
            meta: {
              type: 'problem',
              messages: { missing: 'Добавьте JSDoc для публичного API.' },
              schema: [],
            },
            create(context) {
              const hasDoc = (node) =>
                context.sourceCode
                  .getCommentsBefore(node)
                  .some(
                    (comment) =>
                      comment.type === 'Block' && comment.value.startsWith('*'),
                  )
              return {
                ExportNamedDeclaration(node) {
                  const declaration = node.declaration
                  if (
                    !declaration ||
                    !['FunctionDeclaration', 'ClassDeclaration'].includes(
                      declaration.type,
                    )
                  )
                    return
                  if (!hasDoc(node))
                    context.report({ node, messageId: 'missing' })
                  if (declaration.type === 'ClassDeclaration') {
                    for (const member of declaration.body.body) {
                      if (
                        member.type === 'MethodDefinition' &&
                        member.accessibility !== 'private' &&
                        member.kind !== 'constructor' &&
                        !hasDoc(member)
                      )
                        context.report({ node: member, messageId: 'missing' })
                    }
                  }
                },
              }
            },
          },
        },
      },
    },
    rules: { 'local-jsdoc/public-api': 'error' },
  },
])
