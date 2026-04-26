import { useRef, useEffect, useCallback } from 'react'
import { useStore, type Element } from '../store'

function renderElement(ctx: CanvasRenderingContext2D, element: Element) {
  ctx.strokeStyle = element.strokeColor
  ctx.lineWidth = element.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (element.type === 'rectangle') {
    ctx.beginPath()
    ctx.rect(element.x, element.y, element.width, element.height)
    ctx.stroke()
  } else if (element.type === 'freehand' && element.points && element.points.length > 1) {
    ctx.beginPath()
    ctx.moveTo(element.points[0].x, element.points[0].y)
    for (let i = 1; i < element.points.length; i++) {
      ctx.lineTo(element.points[i].x, element.points[i].y)
    }
    ctx.stroke()
  } else if (element.type === 'arrow' && element.points && element.points.length >= 2) {
    const start = element.points[0]
    const end = element.points[element.points.length - 1]
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const headLen = 12
    ctx.beginPath()
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(
      end.x - headLen * Math.cos(angle - Math.PI / 6),
      end.y - headLen * Math.sin(angle - Math.PI / 6),
    )
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(
      end.x - headLen * Math.cos(angle + Math.PI / 6),
      end.y - headLen * Math.sin(angle + Math.PI / 6),
    )
    ctx.stroke()
  } else if (element.type === 'text' && element.text) {
    ctx.fillStyle = element.strokeColor
    ctx.font = `${element.strokeWidth * 8}px sans-serif`
    ctx.fillText(element.text, element.x, element.y + element.height)
  }
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const elements = useStore((s) => s.elements)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const element of elements) {
      renderElement(ctx, element)
    }
  }, [elements])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      draw()
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ display: 'block' }}
    />
  )
}
