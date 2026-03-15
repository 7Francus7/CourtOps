'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, QrCode } from 'lucide-react'
import { useState } from 'react'

interface BookingQRCodeProps {
  checkinToken: string | null
  size?: number
}

export default function BookingQRCode({ checkinToken, size = 180 }: BookingQRCodeProps) {
  const [copied, setCopied] = useState(false)

  if (!checkinToken) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 text-muted-foreground">
        <QrCode size={32} className="opacity-40" />
        <p className="text-xs">Sin código de check-in</p>
      </div>
    )
  }

  const checkinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/check-in/${checkinToken}`
    : `/check-in/${checkinToken}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(checkinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-2xl">
        <QRCodeSVG value={checkinUrl} size={size} level="M" />
      </div>
      <p className="text-xs text-muted-foreground font-medium">Escanear para Check-in</p>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted"
      >
        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
        {copied ? 'Copiado' : 'Copiar enlace'}
      </button>
    </div>
  )
}
