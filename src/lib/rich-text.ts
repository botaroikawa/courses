// Reading Lexical trees outside the editor: block lookups and heading anchors. Pure, so the
// renderer, the table of contents and the lessons' hooks agree on the same results.

export type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  children?: LexicalNode[]
  fields?: Record<string, unknown>
}

// Every node, rich text nested inside block fields included
export function* lexicalNodes(value: unknown): Generator<LexicalNode> {
  if (Array.isArray(value)) {
    for (const item of value) yield* lexicalNodes(item)
    return
  }
  if (!value || typeof value !== 'object') return
  const node = value as LexicalNode & Record<string, unknown>
  if (typeof node.type === 'string') yield node
  for (const child of Object.values(node)) {
    if (child && typeof child === 'object') yield* lexicalNodes(child)
  }
}

export function blockFieldsOf<T = Record<string, unknown>>(
  content: unknown,
  blockType: string,
): T[] {
  const found: T[] = []
  for (const node of lexicalNodes(content)) {
    if (node.type === 'block' && node.fields?.blockType === blockType) found.push(node.fields as T)
  }
  return found
}

// Text of an inline run, as a reader sees it
export function inlineText(node: LexicalNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'linebreak') return ' '
  return (node.children ?? []).map(inlineText).join('')
}

export function anchorFor(text: string): string {
  return (
    text
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  )
}

export type HeadingAnchor = { id: string; text: string; level: number; node: LexicalNode }

// Top-level H2–H4 with unique ids: a repeated title gets -2, -3… The table of contents lists
// H2 and H3; H4 still gets an id so it can be linked to.
export function headingAnchors(content: unknown): HeadingAnchor[] {
  const root = (content as { root?: LexicalNode } | null)?.root
  const used = new Set<string>()
  const anchors: HeadingAnchor[] = []
  for (const node of root?.children ?? []) {
    if (node.type !== 'heading' || !/^h[2-4]$/.test(node.tag ?? '')) continue
    const text = inlineText(node).trim()
    const base = anchorFor(text)
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    anchors.push({ id, text, level: Number(node.tag?.slice(1)), node })
  }
  return anchors
}
