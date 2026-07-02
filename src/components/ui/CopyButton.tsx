import { useState } from 'react'
import { Button } from './primitives'

export function CopyButton({
  text,
  label = 'Copiar',
  size = 'sm',
}: {
  text: string
  label?: string
  size?: 'sm' | 'md'
}) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <Button type="button" onClick={onCopy} size={size} variant={copied ? 'success' : 'secondary'}>
      {copied ? '✓ Copiado' : `⧉ ${label}`}
    </Button>
  )
}
