// Reading speed used for every locale
export const WORDS_PER_MINUTE = 200

// Text of a Lexical tree, rich text nested in block fields included. Inline text nodes join
// without a gap (a word may be split across bold and plain text); every other node adds one.
function plainText(node: unknown): string {
  if (Array.isArray(node)) return node.map(plainText).join('')
  if (!node || typeof node !== 'object') return ''
  const { children, text, type, ...rest } = node as Record<string, unknown>
  if (type === 'text') return typeof text === 'string' ? text : ''
  const inline = Array.isArray(children) ? children.map(plainText).join('') : ''
  return ` ${inline} ${Object.values(rest).map(plainText).join(' ')} `
}

// Words of a Lexical tree; punctuation on its own is not a word
export function countWords(content: unknown): number {
  return plainText(content)
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}

// Whole minutes, rounded up, so any lesson with content takes at least a minute
export function readingMinutes({
  words,
  videoSeconds = 0,
}: {
  words: number
  videoSeconds?: number
}) {
  return Math.ceil(((words / WORDS_PER_MINUTE) * 60 + videoSeconds) / 60)
}
