import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { parseChartData } from '@/lib/chart-data'
import type { ChartBlock } from '@/payload-types'

import { Figure } from '../figure'
import { ChartView } from './chart-view'

// The CSV is parsed here, so the browser only gets the numbers
export function Chart({ type, title, data, xColumn, caption }: ChartBlock) {
  const parsed = parseChartData(data, { type, xColumn })
  // Saving validates the CSV, so this only skips data written before a rule changed
  if ('error' in parsed) return null
  const { xKey, series, rows } = parsed.data

  return (
    <Figure caption={caption}>
      {title && <p className="mb-3 text-center font-medium">{title}</p>}
      <ChartView type={type} series={series} rows={rows} />
      {/* The same numbers for screen readers */}
      <Table className="sr-only">
        <TableHeader>
          <TableRow>
            <TableHead>{xKey}</TableHead>
            {series.map((name) => (
              <TableHead key={name}>{name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no identity of their own
            <TableRow key={index}>
              <TableHead scope="row">{row.x}</TableHead>
              {row.values.map((value, column) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: columns follow the header
                <TableCell key={column}>{value ?? ''}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Figure>
  )
}
