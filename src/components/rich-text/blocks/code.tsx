import { bundledLanguages, codeToHtml } from 'shiki'

import type { CodeBlock } from '@/payload-types'

import { CopyButton } from './copy-button'

// Highlighted on the server with both themes; globals.css swaps to the dark one under `.dark`
export async function Code({ code, language, filename }: CodeBlock) {
  if (!code) return null
  const lang = language && language in bundledLanguages ? language : 'plaintext'
  const html = await codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
  })
  return (
    <div className="mt-6 overflow-hidden rounded-lg border first:mt-0">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/50 py-1 pr-1 pl-4">
        <span className="truncate font-mono text-muted-foreground text-xs">{filename}</span>
        <CopyButton value={code} />
      </div>
      <div
        className="overflow-x-auto text-sm [&_pre]:p-4 [&_pre]:leading-6"
        // Shiki escapes the code it highlights
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Shiki output
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
