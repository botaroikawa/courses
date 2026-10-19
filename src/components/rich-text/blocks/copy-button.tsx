'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export function CopyButton({ value }: { value: string }) {
  const t = useTranslations('content')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? t('copied') : t('copyCode')}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite" className="sr-only">
        {copied ? t('copied') : ''}
      </span>
    </Button>
  )
}
