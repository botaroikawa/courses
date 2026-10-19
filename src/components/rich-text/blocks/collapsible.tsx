import { ChevronDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export function CollapsibleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Collapsible className="mt-6 rounded-lg border first:mt-0">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-4 py-3 text-left font-medium">
        {title}
        <ChevronDownIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
        />
      </CollapsibleTrigger>
      {/* Stays in the page while closed, so find-in-page and search engines see it */}
      <CollapsibleContent hiddenUntilFound className="border-t px-4 py-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
