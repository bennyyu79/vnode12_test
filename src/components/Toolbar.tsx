import { useStore } from '../store'

const TOOLS = [
  { id: 'select' as const, icon: '⊹', label: 'Select' },
  { id: 'freehand' as const, icon: '✎', label: 'Freehand' },
  { id: 'rectangle' as const, icon: '□', label: 'Rectangle' },
  { id: 'arrow' as const, icon: '↗', label: 'Arrow' },
  { id: 'text' as const, icon: 'T', label: 'Text' },
]

const COLORS = ['#1e1e1e', '#e74c3c', '#e67e22', '#2ecc71', '#3498db', '#9b59b6']
const WIDTHS = [1, 2, 3, 4]

export default function Toolbar() {
  const currentTool = useStore((s) => s.currentTool)
  const setCurrentTool = useStore((s) => s.setCurrentTool)
  const toolSettings = useStore((s) => s.toolSettings)
  const setToolSettings = useStore((s) => s.setToolSettings)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const canUndo = useStore((s) => s.canUndo)
  const canRedo = useStore((s) => s.canRedo)
  const exportPNG = useStore((s) => s.exportPNG)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-gray-800 rounded-xl shadow-lg p-1.5">
      {/* Tools */}
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setCurrentTool(tool.id)}
          title={tool.label}
          className={`flex items-center justify-center w-10 h-10 rounded-lg text-lg transition-colors ${
            currentTool === tool.id
              ? 'bg-white text-gray-900'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tool.icon}
        </button>
      ))}

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Colors */}
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => setToolSettings({ strokeColor: color })}
          title={color}
          className={`w-6 h-6 rounded-full border-2 transition-transform ${
            toolSettings.strokeColor === color ? 'border-white scale-110' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Stroke Width */}
      {WIDTHS.map((w) => (
        <button
          key={w}
          onClick={() => setToolSettings({ strokeWidth: w })}
          title={`Width ${w}`}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            toolSettings.strokeWidth === w ? 'bg-white text-gray-900' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          <div
            className="rounded-full bg-current"
            style={{ width: w * 4 + 4, height: w * 4 + 4 }}
          />
        </button>
      ))}

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
          canUndo ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'
        }`}
      >
        ↩
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
          canRedo ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'
        }`}
      >
        ↪
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Export */}
      <button
        onClick={exportPNG}
        title="Export as PNG"
        className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:bg-gray-700 text-sm font-medium"
      >
        💾
      </button>
    </div>
  )
}
