import { useStore } from '../store'

const TOOLS = [
  { id: 'select' as const, icon: '⊹', label: 'Select' },
  { id: 'freehand' as const, icon: '✎', label: 'Freehand' },
  { id: 'rectangle' as const, icon: '□', label: 'Rectangle' },
  { id: 'arrow' as const, icon: '↗', label: 'Arrow' },
  { id: 'text' as const, icon: 'T', label: 'Text' },
]

export default function Toolbar() {
  const currentTool = useStore((s) => s.currentTool)
  const setCurrentTool = useStore((s) => s.setCurrentTool)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-gray-800 rounded-xl shadow-lg p-1.5">
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
    </div>
  )
}
