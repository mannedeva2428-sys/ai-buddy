import { Mic, History, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function TopNavigation({ statusText = '⚡ Online & Ready', isListening, isSpeaking, extraControls }) {
  return (
    <header className="w-full min-h-[60px] h-15 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-6 md:px-8 z-30 sticky top-0">
      {/* Left: Status Indicator + In-Line Navigation */}
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className={`h-2.5 w-2.5 rounded-full ${isListening ? 'bg-pink-500' : isSpeaking ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`} />
            <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-pink-500/50' : 'bg-emerald-500/50'} animate-ping`} />
          </div>
          <div>
            <h1 className="font-display text-sm md:text-base font-bold text-white tracking-wide leading-none">AI Buddy</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isListening ? '🎙️ Listening...' : isSpeaking ? '🔊 Speaking...' : statusText}
            </p>
          </div>
        </div>

        {/* Inline Navigation Links (Assistant, Chat History, Profile) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 border-l border-white/10 pl-4 sm:pl-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold shadow-sm'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <Mic size={16} />
            <span>Assistant</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold shadow-sm'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <History size={16} />
            <span className="hidden xs:inline">Chat History</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold shadow-sm'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <User size={16} />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      {/* Right: Extra Controls (Auto-read switch, Particle Settings, Clear Chat) */}
      {extraControls && <div className="flex items-center gap-2 sm:gap-3">{extraControls}</div>}
    </header>
  )
}
