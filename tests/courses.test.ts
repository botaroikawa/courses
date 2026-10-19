import { describe, expect, it } from 'vitest'

import { duplicatesOf, lessonIdsOf } from '@/lib/courses'
import { countWords, readingMinutes } from '@/lib/reading-time'

const text = (value: string) => ({ type: 'text', text: value, format: 0 })
const element = (type: string, children: unknown[], extra = {}) => ({ type, children, ...extra })

describe('countWords', () => {
  it('counts words across paragraphs, headings and lists', () => {
    const content = {
      root: element('root', [
        element('heading', [text('Two words')], { tag: 'h2' }),
        element('paragraph', [text('One two three.')]),
        element('list', [element('listitem', [text('four')]), element('listitem', [text('five')])]),
      ]),
    }
    expect(countWords(content)).toBe(7)
  })

  it('joins inline text and keeps block boundaries', () => {
    const content = {
      root: element('root', [
        element('paragraph', [text('hel'), text('lo'), { type: 'linebreak' }, text('world')]),
        element('paragraph', [text('again')]),
      ]),
    }
    expect(countWords(content)).toBe(3)
  })

  it('reads rich text nested in blocks, and skips other block fields', () => {
    const content = {
      root: element('root', [
        {
          type: 'block',
          fields: {
            blockType: 'callout',
            kind: 'warning',
            content: { root: element('root', [element('paragraph', [text('Mind the gap')])]) },
          },
        },
      ]),
    }
    expect(countWords(content)).toBe(3)
  })

  it('ignores lone punctuation and empty content', () => {
    expect(
      countWords({ root: element('root', [element('paragraph', [text('Hola — adiós !')])]) }),
    ).toBe(2)
    expect(countWords(null)).toBe(0)
  })
})

describe('readingMinutes', () => {
  it('rounds up text and video time to whole minutes', () => {
    expect(readingMinutes({ words: 0 })).toBe(0)
    expect(readingMinutes({ words: 1 })).toBe(1)
    expect(readingMinutes({ words: 400 })).toBe(2)
    expect(readingMinutes({ words: 200, videoSeconds: 90 })).toBe(3)
  })
})

describe('syllabus helpers', () => {
  it('lists lesson ids in order, populated or not', () => {
    expect(
      lessonIdsOf([{ lessons: ['a', { id: 'b' }] }, { lessons: null }, { lessons: ['c'] }]),
    ).toEqual(['a', 'b', 'c'])
    expect(lessonIdsOf(undefined)).toEqual([])
  })

  it('reports each duplicate once', () => {
    expect(duplicatesOf(['a', 'b', 'a', 'a', 'c', 'b'])).toEqual(['a', 'b'])
  })
})
