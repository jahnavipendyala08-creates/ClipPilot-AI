import React, { useState } from 'react'
import { Sparkles, Send, CheckCircle2, AlertCircle, HelpCircle, X, ShieldAlert } from 'lucide-react'

export interface ProposedAction {
  action_type: string
  target: string
  parameters: Record<string, unknown>
  explanation: string
}

export interface EditingPlanProposal {
  summary: string
  proposed_actions: ProposedAction[]
  requires_user_approval: boolean
  clarification_questions?: string[]
}

interface AIAssistantPanelProps {
  onClose: () => void
  onApplyPlan?: (plan: EditingPlanProposal) => void
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  onApplyPlan,
}) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [proposal, setProposal] = useState<EditingPlanProposal | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setProposal(null)
    setStatusMessage(null)

    try {
      const response = await fetch('/api/v1/chat/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_request: prompt.trim(),
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server returned error status ${response.status}`)
      }

      const data: EditingPlanProposal = await response.json()
      setProposal(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate editing plan'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = () => {
    if (proposal) {
      if (onApplyPlan) {
        onApplyPlan(proposal)
      }
      setStatusMessage('Plan approved and applied to editor timeline.')
    }
  }

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col text-slate-200 h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="font-semibold text-slate-100">AI Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 text-xs text-slate-300">
          <p className="font-medium text-slate-200 mb-1">How it works:</p>
          <p className="text-slate-400">
            Describe your edit in plain English. The AI generates a structured proposal for your review. No changes are applied without your approval.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 p-3 rounded-lg flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Planning Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 p-3 rounded-lg flex items-center space-x-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{statusMessage}</p>
          </div>
        )}

        {proposal && (
          <div className="bg-slate-800/90 border border-indigo-500/40 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Proposed Editing Plan
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Approval Required
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium">{proposal.summary}</p>

            {proposal.proposed_actions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400">Proposed Actions:</p>
                <ul className="space-y-1.5">
                  {proposal.proposed_actions.map((act, i) => (
                    <li key={i} className="bg-slate-900/70 p-2 rounded border border-slate-700/60 text-xs">
                      <div className="font-semibold text-indigo-300">
                        {act.action_type.toUpperCase()} &rarr; {act.target}
                      </div>
                      <div className="text-slate-300 text-[11px]">{act.explanation}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {proposal.clarification_questions && proposal.clarification_questions.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-800/40 p-2 rounded text-xs text-amber-200">
                <p className="font-semibold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Clarifications Needed:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {proposal.clarification_questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={handleApprove}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs flex items-center justify-center space-x-1 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Apply</span>
              </button>
              <button
                onClick={() => setProposal(null)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your edit (e.g. Add subtitle text to clip)..."
            rows={3}
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-xs p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 resize-none pr-10"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-2 bottom-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </aside>
  )
}
