// CSV for the chart block. Spreadsheets in Spanish export with semicolons and decimal commas, so
// the delimiter is read from the header row, and a decimal comma is accepted unless commas
// separate the columns.

export const chartTypes = ['bar', 'line', 'area', 'pie'] as const
export type ChartType = (typeof chartTypes)[number]

export type ChartData = {
  xKey: string
  series: string[]
  rows: { x: string; values: (number | null)[] }[]
}

const MAX_ROWS = 500

function detectDelimiter(headerLine: string): string {
  const counts = [';', '\t', ','].map((delimiter) => ({
    delimiter,
    count: headerLine.split(delimiter).length,
  }))
  return counts.reduce((best, next) => (next.count > best.count ? next : best)).delimiter
}

// RFC 4180: quoted fields may hold delimiters, line breaks and doubled quotes
export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"' && !field.trim()) {
      quoted = true
      field = ''
    } else if (char === delimiter) {
      row.push(field.trim())
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field.trim())
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  row.push(field.trim())
  rows.push(row)
  return rows.filter((cells) => cells.some((cell) => cell !== ''))
}

function parseNumber(cell: string, decimalComma: boolean): number | null | undefined {
  if (cell === '') return null
  const normalized = decimalComma ? cell.replace(',', '.') : cell
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(normalized)) return undefined
  return Number(normalized)
}

export function parseChartData(
  csv: string,
  { type, xColumn }: { type?: ChartType | null; xColumn?: string | null },
): { data: ChartData } | { error: string } {
  const text = csv.trim()
  if (!text) return { error: 'Paste CSV data with a header row.' }
  const delimiter = detectDelimiter(text.split(/\r?\n/, 1)[0] ?? '')
  const [header, ...body] = parseCsv(text, delimiter)
  if (!header || header.length < 2) {
    return { error: 'The first row must name at least two columns, separated by commas.' }
  }
  if (new Set(header).size !== header.length || header.some((name) => !name)) {
    return { error: 'Every column in the header row needs a different, non-empty name.' }
  }
  if (!body.length) return { error: 'Add at least one row of data below the header.' }
  if (body.length > MAX_ROWS) return { error: `A chart holds at most ${MAX_ROWS} rows.` }

  const xKey = xColumn?.trim() || (header[0] as string)
  const xIndex = header.indexOf(xKey)
  if (xIndex === -1) {
    return { error: `There is no column called "${xKey}". Columns: ${header.join(', ')}.` }
  }
  const series = header.filter((_, index) => index !== xIndex)
  if (type === 'pie' && series.length !== 1) {
    return {
      error: `A pie chart takes one column of values besides "${xKey}"; this data has ${series.length}.`,
    }
  }

  const rows: ChartData['rows'] = []
  for (const [rowIndex, cells] of body.entries()) {
    const line = rowIndex + 2
    if (cells.length !== header.length) {
      return {
        error: `Row ${line} has ${cells.length} values; the header has ${header.length} columns.`,
      }
    }
    const values: (number | null)[] = []
    for (const [index, cell] of cells.entries()) {
      if (index === xIndex) continue
      const value = parseNumber(cell, delimiter !== ',')
      if (value === undefined) {
        return {
          error: `Row ${line}, column "${header[index]}": "${cell}" is not a number. Write numbers without thousands separators.`,
        }
      }
      if (type === 'pie' && (value === null || value < 0)) {
        return { error: `Row ${line}: pie charts need a value of zero or more in every row.` }
      }
      values.push(value)
    }
    rows.push({ x: cells[xIndex] as string, values })
  }
  return { data: { xKey, series, rows } }
}
