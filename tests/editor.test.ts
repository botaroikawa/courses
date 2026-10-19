import { describe, expect, it } from 'vitest'

import { parseChartData } from '@/lib/chart-data'
import { compileExpression, validateExpression } from '@/lib/math-expression'
import { anchorFor, blockFieldsOf, headingAnchors } from '@/lib/rich-text'

describe('compileExpression', () => {
  const at = (source: string, x: number) => compileExpression(source)(x)

  it('follows operator precedence and associativity', () => {
    expect(at('1 + 2 * 3', 0)).toBe(7)
    expect(at('2^3^2', 0)).toBe(512)
    expect(at('-x^2', 3)).toBe(-9)
    expect(at('(1 + x) / 2', 3)).toBe(2)
    expect(at('x ** 2', 4)).toBe(16)
  })

  it('reads implicit multiplication, constants and functions', () => {
    expect(at('2x', 3)).toBe(6)
    expect(at('2(x + 1)', 1)).toBe(4)
    expect(at('(x + 1)(x - 1)', 3)).toBe(8)
    expect(at('2 sin(pi / 2)', 0)).toBeCloseTo(2)
    expect(at('ln(e)', 0)).toBe(1)
    expect(at('3·x − 1', 2)).toBe(5)
  })

  it('rejects anything outside the grammar', () => {
    expect(validateExpression('2x + 1')).toBe(true)
    expect(validateExpression('')).toMatch(/expression/)
    expect(validateExpression('y + 1')).toMatch(/Unknown name "y"/)
    expect(validateExpression('constructor')).toMatch(/Unknown name/)
    expect(validateExpression('alert(1)')).toMatch(/Unknown name/)
    expect(validateExpression('(x + 1')).toMatch(/Expected "\)"/)
    expect(validateExpression('x; 1')).toMatch(/Unexpected ";"/)
  })
})

describe('parseChartData', () => {
  it('reads series by column, with the first column as x by default', () => {
    const parsed = parseChartData('month,visits,signups\nJan,10,1\nFeb,12.5,', {})
    expect(parsed).toEqual({
      data: {
        xKey: 'month',
        series: ['visits', 'signups'],
        rows: [
          { x: 'Jan', values: [10, 1] },
          { x: 'Feb', values: [12.5, null] },
        ],
      },
    })
  })

  it('accepts spreadsheet exports with semicolons and decimal commas', () => {
    const parsed = parseChartData('valor;"mes, año"\n3,5;"enero, 2026"', { xColumn: 'mes, año' })
    expect(parsed).toEqual({
      data: { xKey: 'mes, año', series: ['valor'], rows: [{ x: 'enero, 2026', values: [3.5] }] },
    })
  })

  it('explains what is wrong', () => {
    expect(parseChartData('', {})).toEqual({ error: expect.stringMatching(/header row/) })
    expect(parseChartData('a,b\n1,2', { xColumn: 'c' })).toEqual({
      error: expect.stringMatching(/no column called "c"/),
    })
    expect(parseChartData('a,b\nx,1,2', {})).toEqual({
      error: expect.stringMatching(/Row 2 has 3/),
    })
    expect(parseChartData('a,b\nx,1.000,5', {})).toEqual({ error: expect.stringMatching(/Row 2/) })
    expect(parseChartData('a,b\nx,1,000', {})).toEqual({
      error: expect.stringMatching(/Row 2 has 3/),
    })
    expect(parseChartData('a,b,c\nx,1,2', { type: 'pie' })).toEqual({
      error: expect.stringMatching(/one column of values/),
    })
  })
})

describe('headingAnchors', () => {
  const heading = (tag: string, text: string) => ({
    type: 'heading',
    tag,
    children: [{ type: 'text', text }],
  })

  it('slugs headings without accents and numbers repeats', () => {
    const content = {
      root: {
        children: [
          heading('h2', 'Introducción'),
          heading('h3', 'Qué es'),
          { type: 'paragraph', children: [] },
          heading('h2', 'Introducción'),
          heading('h4', '¿?'),
          heading('h1', 'Ignored'),
        ],
      },
    }
    expect(headingAnchors(content).map(({ id, level }) => [id, level])).toEqual([
      ['introduccion', 2],
      ['que-es', 3],
      ['introduccion-2', 2],
      ['section', 4],
    ])
    expect(anchorFor('Àlgebra lineal: 2ª part')).toBe('algebra-lineal-2a-part')
  })

  it('finds blocks anywhere in the tree', () => {
    const video = { type: 'block', fields: { blockType: 'video', video: 'v1' } }
    const content = {
      root: {
        children: [
          video,
          {
            type: 'block',
            fields: { blockType: 'collapsible', content: { root: { children: [video] } } },
          },
        ],
      },
    }
    expect(blockFieldsOf(content, 'video')).toHaveLength(2)
  })
})
