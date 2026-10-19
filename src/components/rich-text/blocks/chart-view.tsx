'use client'

import { useReducedMotionConfig } from 'motion/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartData, ChartType } from '@/lib/chart-data'

const color = (index: number) => `var(--chart-${(index % 5) + 1})`

// Series and slices get safe keys (s0, s1…): the chart config turns keys into CSS variables
export function ChartView({
  type,
  series,
  rows,
}: {
  type: ChartType
  series: string[]
  rows: ChartData['rows']
}) {
  const animate = !useReducedMotionConfig()

  if (type === 'pie') {
    const config: ChartConfig = Object.fromEntries(
      rows.map((row, index) => [`p${index}`, { label: row.x, color: color(index) }]),
    )
    const data = rows.map((row, index) => ({
      key: `p${index}`,
      value: row.values[0],
      fill: `var(--color-p${index})`,
    }))
    return (
      <ChartContainer config={config} className="mx-auto aspect-square max-h-80">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="key" isAnimationActive={animate} />
          <ChartLegend content={<ChartLegendContent nameKey="key" />} className="flex-wrap" />
        </PieChart>
      </ChartContainer>
    )
  }

  const config: ChartConfig = Object.fromEntries(
    series.map((name, index) => [`s${index}`, { label: name, color: color(index) }]),
  )
  const data = rows.map((row) => ({
    x: row.x,
    ...Object.fromEntries(row.values.map((value, index) => [`s${index}`, value])),
  }))
  const keys = series.map((_, index) => `s${index}`)
  const Chart = { bar: BarChart, line: LineChart, area: AreaChart }[type]

  return (
    <ChartContainer config={config} className="min-h-64 w-full">
      <Chart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width="auto" />
        <ChartTooltip content={<ChartTooltipContent />} />
        {keys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {keys.map((key) =>
          type === 'bar' ? (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={4}
              isAnimationActive={animate}
            />
          ) : type === 'line' ? (
            <Line
              key={key}
              dataKey={key}
              type="monotone"
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={animate}
            />
          ) : (
            <Area
              key={key}
              dataKey={key}
              type="monotone"
              stroke={`var(--color-${key})`}
              fill={`var(--color-${key})`}
              fillOpacity={0.3}
              isAnimationActive={animate}
            />
          ),
        )}
      </Chart>
    </ChartContainer>
  )
}
