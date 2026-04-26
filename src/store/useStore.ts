import { create } from 'zustand'
import type { Element, ToolSettings, ToolType } from './types'

export interface WhiteboardState {
  elements: Element[]
  selectedId: string | null
  currentTool: ToolType
  toolSettings: ToolSettings

  setElements: (elements: Element[]) => void
  addElement: (element: Element) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
  setSelected: (id: string | null) => void
  setCurrentTool: (tool: ToolType) => void
  setToolSettings: (settings: Partial<ToolSettings>) => void
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useStore = create<WhiteboardState>((set) => ({
  elements: [],
  selectedId: null,
  currentTool: 'select',
  toolSettings: { strokeColor: '#1e1e1e', strokeWidth: 2 },

  setElements: (elements) => set({ elements }),
  addElement: (element) =>
    set((s) => ({ elements: [...s.elements, element] })),
  updateElement: (id, updates) =>
    set((s) => ({
      elements: s.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  deleteElement: (id) =>
    set((s) => ({
      elements: s.elements.filter((e) => e.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  setSelected: (id) => set({ selectedId: id }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setToolSettings: (settings) =>
    set((s) => ({ toolSettings: { ...s.toolSettings, ...settings } })),
}))

export { genId }
