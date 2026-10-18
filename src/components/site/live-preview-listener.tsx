'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

import { env } from '@/env'

// Re-renders the server page whenever the document is autosaved in the admin panel
export function LivePreviewListener() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={env.NEXT_PUBLIC_SITE_URL} />
  )
}
