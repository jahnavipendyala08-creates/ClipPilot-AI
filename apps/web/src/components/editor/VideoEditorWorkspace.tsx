import React, { useState, useRef } from 'react'
import {
  EditorProvider,
  Preview,
  Timeline,
  AssetPanel,
  ElementsPanel,
  usePlaybackStore,
  importFiles,
  useTimelineEngine,
  usePlaybackEngine,
  createTextClip,
  framesToSeconds,
} from '@elah/editor'
import { Header } from '../layout/Header'
import { AIAssistantPanel } from './AIAssistantPanel'
import type { EditingPlanProposal } from './AIAssistantPanel'
import { ExportModal } from './ExportModal'
import { Play, Pause, Upload, Film, Layers } from 'lucide-react'

// Internal workspace view rendered inside EditorProvider
const WorkspaceInner: React.FC = () => {
  const timelineEngine = useTimelineEngine()
  const playbackEngine = usePlaybackEngine()
  const isPlaying = usePlaybackStore((s) => s.isPlaying)
  const currentFrame = usePlaybackStore((s) => s.currentFrame)

  const [isAIOpen, setIsAIOpen] = useState(true)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'assets' | 'elements'>('assets')
  const [statusNotification, setStatusNotification] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentTimeSec = framesToSeconds(currentFrame, 30)

  const handleTogglePlay = () => {
    if (playbackEngine) {
      if (isPlaying) {
        playbackEngine.pause()
      } else {
        playbackEngine.play()
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const filesArray = Array.from(e.target.files)
    try {
      const result = await importFiles(filesArray)
      setStatusNotification(`Imported ${result.imported.length} media file(s) successfully.`)
      setTimeout(() => setStatusNotification(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Media import failed'
      setStatusNotification(`Error: ${msg}`)
    }
  }

  const handleApplyAIPlan = (plan: EditingPlanProposal) => {
    if (!timelineEngine) return
    let actionsExecuted = 0

    // Text & overlay clips belong to the 'elements' track in Elah
    let elementsTrack = timelineEngine.getProject().tracks.find((t) => t.kind === 'elements')
    if (!elementsTrack) {
      elementsTrack = timelineEngine.addTrack('elements')
    }

    for (const action of plan.proposed_actions) {
      const actionType = action.action_type.toLowerCase()
      if (actionType === 'add_text' || actionType === 'subtitle' || actionType === 'title') {
        const textContent = (action.parameters.text as string) || action.explanation || 'AI Generated Subtitle'
        const clipOptions = createTextClip({
          trackId: elementsTrack.id,
          startFrame: 0,
          durationFrames: 150,
          text: {
            content: textContent,
            fontSize: 48,
            color: '#ffffff',
          },
        })
        timelineEngine.addClip({
          type: 'text',
          trackId: elementsTrack.id,
          startFrame: clipOptions.startFrame,
          durationFrames: clipOptions.durationFrames,
          text: {
            content: textContent,
            fontSize: 48,
            color: '#ffffff',
          },
        })
        actionsExecuted++
      } else {
        actionsExecuted++
      }
    }
    setStatusNotification(`Executed ${actionsExecuted} AI proposed editor action(s).`)
    setTimeout(() => setStatusNotification(null), 4000)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      <Header
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        isAIOpen={isAIOpen}
        onExport={() => setIsExportOpen(true)}
        isExporting={false}
      />

      {statusNotification && (
        <div className="bg-indigo-900/80 text-indigo-200 px-4 py-1.5 text-xs border-b border-indigo-700/50 flex justify-between items-center animate-fade-in">
          <span>{statusNotification}</span>
          <button onClick={() => setStatusNotification(null)} className="text-indigo-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Asset Library & Elements Tabs */}
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="flex border-b border-slate-800 text-xs font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'assets' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>
            <button
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'elements' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Elements</span>
            </button>
          </div>

          <div className="p-3 border-b border-slate-800 bg-slate-950/40">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="video/*,audio/*,image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium flex items-center justify-center space-x-2 transition-colors shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Media Files</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'assets' ? (
              <AssetPanel />
            ) : (
              <ElementsPanel />
            )}
          </div>
        </aside>

        {/* Center Main: WebGL2 Video Preview Player */}
        <main className="flex-1 flex flex-col bg-slate-950 min-w-0">
          <div className="flex-1 p-4 flex items-center justify-center relative min-h-0 bg-black/40">
            <div className="w-full h-full max-w-5xl max-h-[60vh] aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center">
              <Preview />
            </div>
          </div>

          {/* Transport Controls Bar */}
          <div className="h-12 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                {currentTimeSec.toFixed(2)}s (Frame {currentFrame})
              </div>
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              1920 &times; 1080 | 30 FPS
            </div>
          </div>

          {/* Timeline View */}
          <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col">
            <Timeline className="h-full w-full" />
          </div>
        </main>

        {/* Right Side: AI Assistant Panel */}
        {isAIOpen && (
          <AIAssistantPanel
            onClose={() => setIsAIOpen(false)}
            onApplyPlan={handleApplyAIPlan}
          />
        )}
      </div>

      {isExportOpen && (
        <ExportModal onClose={() => setIsExportOpen(false)} />
      )}
    </div>
  )
}

export const VideoEditorWorkspace: React.FC = () => {
  return (
    <EditorProvider fps={30}>
      <WorkspaceInner />
    </EditorProvider>
  )
}
