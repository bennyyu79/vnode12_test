import { useRef, useEffect, useCallback, useState } from 'react'
import { useStore, type Element, type Point, genId } from '../store'

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

// Draw a temporary preview element while dragging
function renderPreview(ctx: CanvasRenderingContext2D, tool: string, start: Point, end: Point, color: string, width: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (tool === 'rectangle') {
    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const w = Math.abs(end.x - start.x)
    const h = Math.abs(end.y - start.y)
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.stroke()
  } else if (tool === 'freehand') {
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  } else if (tool === 'arrow') {
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
  }
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const elements = useStore((s) => s.elements)
  const currentTool = useStore((s) => s.currentTool)
  const toolSettings = useStore((s) => s.toolSettings)
  const addElement = useStore((s) => s.addElement)

  const isDrawing = useRef(false)
  const startPos = useRef<Point>({ x: 0, y: 0 })
  const currentPoints = useRef<Point[]>([])

  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null)
  const [textValue, setTextValue] = useState('')

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

    // Draw preview while drawing
    if (isDrawing.current && currentTool !== 'text' && currentTool !== 'select') {
      const end = currentPoints.current.length > 0
        ? currentPoints.current[currentPoints.current.length - 1]
        : startPos.current
      renderPreview(ctx, currentTool, startPos.current, end, toolSettings.strokeColor, toolSettings.strokeWidth)
    }
  }, [elements, currentTool, toolSettings])

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

  const getPos = (e: React.MouseEvent) => ({
    x: e.clientX,
    y: e.clientY,
  })

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e)

    if (currentTool === 'text') {
      setTextPos(pos)
      setTextValue('')
      return
    }
    if (currentTool === 'select') return

    isDrawing.current = true
    startPos.current = pos
    currentPoints.current = [pos]
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const pos = getPos(e)
    if (currentTool === 'freehand') {
      currentPoints.current.push(pos)
    }
    draw()
  }

  const handleMouseUp = () => {
    if (!isDrawing.current) return
    isDrawing.current = false

    if (currentTool === 'freehand' && currentPoints.current.length > 1) {
      addElement({
        id: genId(),
        type: 'freehand',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        points: [...currentPoints.current],
        strokeColor: toolSettings.strokeColor,
        strokeWidth: toolSettings.strokeWidth,
        backgroundColor: '',
      })
    } else if (currentTool === 'rectangle') {
      const end = currentPoints.current.length > 1
        ? currentPoints.current[currentPoints.current.length - 1]
        : startPos.current
      const x = Math.min(startPos.current.x, end.x)
      const y = Math.min(startPos.current.y, end.y)
      const w = Math.abs(end.x - startPos.current.x)
      const h = Math.abs(end.y - startPos.current.y)
      if (w > 2 && h > 2) {
        addElement({
          id: genId(),
          type: 'rectangle',
          x, y, width: w, height: h,
          strokeColor: toolSettings.strokeColor,
          strokeWidth: toolSettings.strokeWidth,
          backgroundColor: '',
        })
      }
    } else if (currentTool === 'arrow') {
      const end = currentPoints.current.length > 1
        ? currentPoints.current[currentPoints.current.length - 1]
        : startPos.current
      if (Math.abs(end.x - startPos.current.x) > 5 || Math.abs(end.y - startPos.current.y) > 5) {
        addElement({
          id: genId(),
          type: 'arrow',
          x: startPos.current.x,
          y: startPos.current.y,
          width: end.x - startPos.current.x,
          height: end.y - startPos.current.y,
          points: [startPos.current, end],
          strokeColor: toolSettings.strokeColor,
          strokeWidth: toolSettings.strokeWidth,
          backgroundColor: '',
        })
      }
    }
    currentPoints.current = []
  }

  const handleTextSubmit = () => {
    if (!textPos || !textValue.trim()) {
      setTextPos(null)
      return
    }
    addElement({
      id: genId(),
      type: 'text',
      x: textPos.x,
      y: textPos.y,
      width: textValue.length * 12,
      height: 20,
      text: textValue,
      strokeColor: toolSettings.strokeColor,
      strokeWidth: toolSettings.strokeWidth,
      backgroundColor: '',
    })
    setTextPos(null)
    setTextValue('')
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ display: 'block', cursor: currentTool === 'select' ? 'default' : 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {textPos && (
        <div
          className="fixed z-50"
          style={{ left: textPos.x, top: textPos.y }}
        >
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit() }}
            onBlur={handleTextSubmit}
            autoFocus
            className="border border-gray-400 rounded px-1 py-0.5 text-sm outline-none"
            style={{ minWidth: 120 }}
          />
        </div>
      )}
    </>
  )
}
