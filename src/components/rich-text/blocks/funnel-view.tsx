'use client'

import { useReducedMotionConfig } from 'motion/react'
import { Funnel, FunnelChart, LabelList } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// The stages are listed in text under the chart, so the shape itself is hidden from screen readers
export function FunnelView({
  stages,
  measured,
}: {
  stages: { label: string; value: number }[]
  measured: boolean
}) {
  const animate = !useReducedMotionConfig()
  const config: ChartConfig = Object.fromEntries(
    stages.map((stage, index) => [
      `f${index}`,
      { label: stage.label, color: `var(--chart-${(index % 5) + 1})` },
    ]),
  )
  const data = stages.map((stage, index) => ({
    key: `f${index}`,
    label: stage.label,
    value: stage.value,
    fill: `var(--color-f${index})`,
  }))

  return (
    <ChartContainer config={config} aria-hidden className="mx-auto aspect-[2/1] max-h-72 w-full">
      <FunnelChart accessibilityLayer={false}>
        {measured && <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />}
        <Funnel data={data} dataKey="value" nameKey="key" isAnimationActive={animate}>
          {/* A halo in the background colour keeps the label readable on any fill */}
          <LabelList
            dataKey="label"
            position="center"
            className="fill-foreground font-medium text-xs"
            stroke="var(--background)"
            strokeWidth={3}
            style={{ paintOrder: 'stroke' }}
          />
        </Funnel>
      </FunnelChart>
    </ChartContainer>
  )
}
