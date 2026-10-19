'use client'

import 'mafs/core.css'

import { Coordinates, Mafs, Plot, Point, Polygon, Text, Theme } from 'mafs'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

import { compileExpression } from '@/lib/math-expression'
import type { FunctionPlotBlock } from '@/payload-types'

const palette = [Theme.blue, Theme.red, Theme.green, Theme.orange, Theme.violet, Theme.pink]
const SAMPLES = 200

type Props = Omit<FunctionPlotBlock, 'caption' | 'blockType' | 'id'>

// Static: no pan or zoom, so scrolling the lesson never gets caught by the plot
export function FunctionPlotView({
  xMin,
  xMax,
  yMin,
  yMax,
  xLabel,
  yLabel,
  hideNumbers,
  curves,
  points,
}: Props) {
  const t = useTranslations('content')
  const compiled = useMemo(
    () =>
      (curves ?? []).flatMap((curve, index) => {
        try {
          return [
            {
              ...curve,
              fn: compileExpression(curve.expression),
              color: palette[index % palette.length],
            },
          ]
        } catch {
          // Saving validates expressions; skip one that a later rule rejects
          return []
        }
      }),
    [curves],
  )

  const axis = hideNumbers ? { labels: false as const } : {}
  // Axis labels sit on the axes when they are in view, otherwise on the plot's edge
  const xAxisY = Math.min(Math.max(0, yMin), yMax)
  const yAxisX = Math.min(Math.max(0, xMin), xMax)

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* The drawing is an SVG without text alternatives; this is what it plots */}
      <ul className="sr-only">
        {compiled.map((curve) => (
          <li key={curve.id}>
            {t('plotCurve', { label: curve.label || 'empty', expression: curve.expression })}
          </li>
        ))}
        {points?.map((point) => (
          <li key={point.id}>
            {t('plotPoint', { label: point.label || 'empty', x: point.x, y: point.y })}
          </li>
        ))}
      </ul>
      <Mafs
        viewBox={{ x: [xMin, xMax], y: [yMin, yMax], padding: 0 }}
        preserveAspectRatio={false}
        pan={false}
        zoom={false}
        height={320}
      >
        <Coordinates.Cartesian xAxis={axis} yAxis={axis} />
        {compiled.map((curve) => {
          if (!curve.shade || curve.shade === 'none') return null
          const from = Math.max(curve.shadeFrom ?? xMin, xMin)
          const to = Math.min(curve.shadeTo ?? xMax, xMax)
          if (!(to > from)) return null
          const edge = curve.shade === 'above' ? yMax : yMin
          const samples = Array.from({ length: SAMPLES + 1 }, (_, i) => {
            const x = from + ((to - from) * i) / SAMPLES
            const y = curve.fn(x)
            return [x, Number.isFinite(y) ? Math.min(Math.max(y, yMin), yMax) : edge] as [
              number,
              number,
            ]
          })
          return (
            <Polygon
              key={`${curve.id}-shade`}
              points={[[from, edge], ...samples, [to, edge]]}
              color={curve.color}
              fillOpacity={0.15}
              weight={0}
            />
          )
        })}
        {compiled.map((curve) => (
          <Plot.OfX key={curve.id} y={curve.fn} color={curve.color} />
        ))}
        {points?.map((point) => (
          <g key={point.id}>
            <Point x={point.x} y={point.y} color={Theme.foreground} />
            {point.label && (
              <Text x={point.x} y={point.y} attach="ne" size={14}>
                {point.label}
              </Text>
            )}
          </g>
        ))}
        {xLabel && (
          <Text x={xMax} y={xAxisY} attach="nw" size={14}>
            {xLabel}
          </Text>
        )}
        {yLabel && (
          <Text x={yAxisX} y={yMax} attach="se" size={14}>
            {yLabel}
          </Text>
        )}
      </Mafs>
      {compiled.some((curve) => curve.label) && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t px-4 py-2 text-sm">
          {compiled.map((curve) =>
            curve.label ? (
              <li key={curve.id} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-0.5 w-4 rounded"
                  style={{ backgroundColor: curve.color }}
                />
                {curve.label}
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  )
}
