import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react'
import { agreementAPI } from '../services/api'
import { useTheme } from '../context/ThemeContext'

export default function TermsModal({ isOpen, onClose, onAccept }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [terms, setTerms] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      agreementAPI
        .getTerms()
        .then((res) => setTerms(res.data))
        .catch(() => {
          // Fallback static terms
          setTerms({
            version: '1.0.0',
            title: 'AI Voice Assistant User Agreement & Terms of Service',
            last_updated: '2026-08-11',
            content: 'Welcome to AI Voice Assistant. By using our platform, you agree to these Terms of Service.',
            sections: [
              {
                heading: '1. Acceptance of Terms',
                body: 'By creating an account or using AI Voice Assistant, you accept all terms outlined in this agreement.',
              },
              {
                heading: '2. Privacy & Voice Data Handling',
                body: 'Voice inputs are processed securely to generate AI responses. Audio data is kept strictly confidential.',
              },
              {
                heading: '3. AI Usage & Disclaimer',
                body: 'AI outputs are for informational purposes and should be verified for critical applications.',
              },
            ],
          })
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-white/10 text-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-950/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">User Agreement & Terms</h3>
                <p className="text-[11px] text-slate-400">
                  Version {terms?.version || '1.0.0'} • Updated {terms?.last_updated || '2026-08-11'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed chat-scroll flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <p className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-indigo-50/50 border-indigo-100 text-indigo-900' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                }`}>
                  {terms?.content}
                </p>

                {terms?.sections?.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-bold text-xs text-indigo-400">{sec.heading}</h4>
                    <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>{sec.body}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer controls */}
          <div className={`flex items-center justify-between px-6 py-4 border-t ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-950/50'
          }`}>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>SSL Protected Agreement</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Close
              </button>
              {onAccept && (
                <button
                  onClick={() => {
                    onAccept()
                    onClose()
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Accept</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
