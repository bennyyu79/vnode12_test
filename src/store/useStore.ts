import { create } from 'zustand'
import type { Element, ToolSettings, ToolType } from './types'

const STORAGE_KEY = 'collabboard-elements'

function loadElements(): Element[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return []
}

function saveElements(elements: Element[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements))
  } catch { /* ignore */ }
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface HistoryState {
  past: Element[][]
  future: Element[][]
}

export interface WhiteboardState {
  elements: Element[]
  selectedId: string | null
  currentTool: ToolType
  toolSettings: ToolSettings
  history: HistoryState

  setElements: (elements: Element[]) => void
  addElement: (element: Element) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
  setSelected: (id: string | null) => void
  setCurrentTool: (tool: ToolType) => void
  setToolSettings: (settings: Partial<ToolSettings>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  exportPNG: () => void
}

function pushHistory(state: WhiteboardState): HistoryState {
  return {
    past: [...state.history.past.slice(0, 49), state.elements],
    future: [],
  }
}

export const useStore = create<WhiteboardState>((set, get) => ({
  elements: loadElements(),
  selectedId: null,
  currentTool: 'select',
  toolSettings: { strokeColor: '#1e1e1e', strokeWidth: 2 },
  history: { past: [], future: [] },
  canUndo: false,
  canRedo: false,

  setElements: (elements) => {
    set({ elements, history: pushHistory(get()), canUndo: true, canRedo: false })
    saveElements(elements)
  },
  addElement: (element) => {
    const state = get()
    const newElements = [...state.elements, element]
    set({ elements: newElements, history: pushHistory(state), canUndo: true, canRedo: false })
    saveElements(newElements)
  },
  updateElement: (id, updates) => {
    const state = get()
    const newElements = state.elements.map((e) => (e.id === id ? { ...e, ...updates } : e))
    set({ elements: newElements, history: pushHistory(state), canUndo: true, canRedo: false })
    saveElements(newElements)
  },
  deleteElement: (id) => {
    const state = get()
    const newElements = state.elements.filter((e) => e.id !== id)
    const newSelected = state.selectedId === id ? null : state.selectedId
    set({
      elements: newElements,
      selectedId: newSelected,
      history: pushHistory(state),
      canUndo: true,
      canRedo: false,
    })
    saveElements(newElements)
  },
  setSelected: (id) => set({ selectedId: id }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setToolSettings: (settings) =>
    set((s) => ({ toolSettings: { ...s.toolSettings, ...settings } })),

  undo: () => {
    const state = get()
    if (state.history.past.length === 0) return
    const previous = state.history.past[state.history.past.length - 1]
    const newPast = state.history.past.slice(0, -1)
    set({
      elements: previous,
      history: { past: newPast, future: [state.elements, ...state.history.future] },
      canUndo: newPast.length > 0,
      canRedo: true,
    })
    saveElements(previous)
  },
  redo: () => {
    const state = get()
    if (state.history.future.length === 0) return
    const next = state.history.future[0]
    const newFuture = state.history.future.slice(1)
    set({
      elements: next,
      history: { past: [...state.history.past, state.elements], future: newFuture },
      canUndo: true,
      canRedo: newFuture.length > 0,
    })
    saveElements(next)
  },

  exportPNG: () => {
    const canvas = document.createElement('canvas')
    const padding = 40
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    const elements = get().elements
    if (elements.length === 0) {
      canvas.width = 400
      canvas.height = 300
    } else {
      for (const el of elements) {
        if (el.x < minX) minX = el.x
        if (el.y < minY) minY = el.y
        if (el.x + el.width > maxX) maxX = el.x + el.width
        if (el.y + el.height > maxY) maxY = el.y + el.height
        if (el.points) {
          for (const p of el.points) {
            if (p.x < minX) minX = p.x
            if (p.y < minY) minY = p.y
            if (p.x > maxX) maxX = p.x
            if (p.y > maxY) maxY = p.y
          }
        }
      }
      canvas.width = maxX - minX + padding * 2
      canvas.height = maxY - minY + padding * 2
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.translate(padding - minX, padding - minY)

    // Render all elements
    for (const element of elements) {
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
        ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
      } else if (element.type === 'text' && element.text) {
        ctx.fillStyle = element.strokeColor
        ctx.font = `${element.strokeWidth * 8}px sans-serif`
        ctx.fillText(element.text, element.x, element.y + element.height)
      }
    }

    const link = document.createElement('a')
    link.download = 'collabboard.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  },
}))

export { genId }
