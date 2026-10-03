import React from 'react'
import { Sparkles, Download, Film } from 'lucide-react'

interface HeaderProps {
  onToggleAI: () => void
  isAIOpen: boolean
  onExport: () => void
  isExporting: boolean
}

export const Header: React.FC<HeaderProps> = ({
  onToggleAI,
  isAIOpen,
  onExport,
  isExporting,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-slate-100 select-none">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <Film className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide flex items-center gap-2">
            ClipPilot AI
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-medium px-2 py-0.5 rounded border border-indigo-500/30">
              Elah Powered
            </span>
          </h1>
          <p className="text-xs text-slate-400">Describe it. Edit it. Own the result.</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleAI}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isAIOpen
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 shadow-md shadow-emerald-900/30"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export Video'}</span>
        </button>
      </div>
    </header>
  )
}
