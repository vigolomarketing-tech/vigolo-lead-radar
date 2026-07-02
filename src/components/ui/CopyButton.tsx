import { useState } from 'react'
import { Button } from './Button'

interface CopyButtonProps {
  text: string
  label?: string
  size?: 'sm' | 'md'
  variant?: 'primary' | 'secondary' | 'ghost'
}

/** Boton "Copiar" con feedback temporal de "Copiado!". */
export function CopyButton({
  text,
  label = 'Copiar',
  size = 'sm',
  variant = 'secondary',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback para navegadores sin permiso de clipboard.
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
    <Button
      type="button"
      onClick={onCopy}
      size={size}
      variant={copied ? 'primary' : variant}
    >
      {copied ? '✓ Copiado' : `⧉ ${label}`}
    </Button>
  )
}
