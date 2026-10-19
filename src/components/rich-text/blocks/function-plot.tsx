import type { FunctionPlotBlock } from '@/payload-types'

import { Figure } from '../figure'
import { FunctionPlotView } from './function-plot-view'

export function FunctionPlot({ caption, ...plot }: FunctionPlotBlock) {
  if (!plot.curves?.length) return null
  return (
    <Figure caption={caption}>
      <FunctionPlotView {...plot} />
    </Figure>
  )
}
