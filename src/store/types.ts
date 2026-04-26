export type ElementType = 'freehand' | 'rectangle' | 'arrow' | 'text'

export interface Point {
  x: number
  y: number
}

export interface Element {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  points?: Point[]
  text?: string
  strokeColor: string
  strokeWidth: number
  backgroundColor: string
}

export type ToolType = ElementType | 'select'

export interface ToolSettings {
  strokeColor: string
  strokeWidth: number
}
