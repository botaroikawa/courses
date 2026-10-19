import { CodeBlock } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

// Monaco ids, which Shiki also understands, so the admin and the site highlight alike
export const codeLanguages = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  shell: 'Shell',
  python: 'Python',
  sql: 'SQL',
  yaml: 'YAML',
  markdown: 'Markdown',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  csharp: 'C#',
  cpp: 'C / C++',
  plaintext: 'Plain text',
}

// Payload's code block (Monaco editor, language picker), plus an optional file name
const base = CodeBlock({
  slug: 'code',
  languages: codeLanguages,
  defaultLanguage: 'typescript',
  fieldOverrides: { interfaceName: 'CodeBlock', labels: { singular: 'Code', plural: 'Code' } },
})
const [language, ...rest] = base.fields

export const codeBlock: Block = {
  ...base,
  fields: [
    ...(language ? [language] : []),
    {
      name: 'filename',
      type: 'text',
      admin: { placeholder: 'File name (optional), e.g. src/app.ts' },
    },
    ...rest,
  ],
}
