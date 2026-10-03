import React, { useState } from 'react'
import { exportVideo, useTimelineEngine, usePlaybackEngine } from '@elah/editor'
import type { ExportProgress } from '@elah/core'
import { Download, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface ExportModalProps {
  onClose: () => void
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const timelineEngine = useTimelineEngine()
  const playbackEngine = usePlaybackEngine()
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStartExport = async () => {
    if (!timelineEngine) {
      setError('Timeline engine is not initialized')
      return
    }

    setIsExporting(true)
    setProgress(0)
    setError(null)
    setExportUrl(null)

    try {
      // Pause playback prior to export
      if (playbackEngine) {
        playbackEngine.pause()
      }

      const project = timelineEngine.getProject()

      // Execute export using @elah/editor exportVideo function
      const resultBlob = await exportVideo(project, {
        outputHeight: 1080,
        onProgress: (p: ExportProgress) => {
          const pct = p.totalFrames > 0 ? Math.round((p.frame / p.totalFrames) * 100) : 0
          setProgress(pct)
        },
      })

      const url = URL.createObjectURL(resultBlob)
      setExportUrl(url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Video export failed'
      setError(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Download className="w-5 h-5 text-emerald-400" />
          <span>Export Video</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Render your timeline project to an MP4 video file.
        </p>

        {error && (
          <div className="mb-4 bg-rose-950/40 border border-rose-800/60 text-rose-300 p-3 rounded-lg flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Export Failed</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isExporting ? (
          <div className="space-y-4 py-4 text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <div>
              <p className="font-medium text-sm">Rendering MP4 Video...</p>
              <p className="text-xs text-slate-400 mt-0.5">{progress}% Complete</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : exportUrl ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100">Render Complete!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Your exported MP4 video is ready for download.
              </p>
            </div>
            <a
              href={exportUrl}
              download="clippilot_export.mp4"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/40"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </a>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="bg-slate-800/60 p-3 rounded-lg text-xs text-slate-300 space-y-1 border border-slate-700/50">
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution:</span>
                <span className="font-medium">1920 &times; 1080 (1080p)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Frame Rate:</span>
                <span className="font-medium">30 FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-medium">MP4 (H.264 / AAC)</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleStartExport}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Start Export</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
