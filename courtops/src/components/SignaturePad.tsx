'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Eraser } from 'lucide-react'

interface SignaturePadProps {
  onSignature: (data: string) => void
  width?: number
  height?: number
}

export default function SignaturePad({ onSignature, width = 400, height = 160 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    }
  }

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    setHasDrawn(true)
    const canvas = canvasRef.current
    if (canvas) {
      onSignature(canvas.toDataURL('image/png'))
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    onSignature('')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">Firmar aquí</p>
        {hasDrawn && (
          <button onClick={clear} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Eraser size={12} />
            Limpiar
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full border border-border rounded-xl bg-muted/30 cursor-crosshair touch-none"
        style={{ height: `${height}px` }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  )
}
