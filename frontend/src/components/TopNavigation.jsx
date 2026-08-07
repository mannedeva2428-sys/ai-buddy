import { Mic, History, User, Sun, Moon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function TopNavigation({ statusText = '⚡ Online & Ready', isListening, isSpeaking, extraControls }) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <header className={`w-full min-h-[60px] h-15 backdrop-blur-xl border-b transition-colors flex items-center justify-between px-4 sm:px-6 md:px-8 z-30 sticky top-0 ${
      isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-white/10 text-white'
    }`}>
      {/* Left: Status Indicator + In-Line Navigation */}
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className={`h-2.5 w-2.5 rounded-full ${isListening ? 'bg-pink-500' : isSpeaking ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`} />
            <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-pink-500/50' : 'bg-emerald-500/50'} animate-ping`} />
          </div>
          <div>
            <h1 className={`font-display text-sm md:text-base font-bold tracking-wide leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
              AI Buddy
            </h1>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isListening ? '🎙️ Listening...' : isSpeaking ? '🔊 Speaking...' : statusText}
            </p>
          </div>
        </div>

        {/* Inline Navigation Links (Assistant, Chat History, Profile) */}
        <nav className={`flex items-center gap-1.5 sm:gap-2 border-l pl-4 sm:pl-6 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? isLight
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold shadow-sm'
                    : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold shadow-sm'
                  : isLight
                    ? 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                  ? isLight
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold shadow-sm'
                    : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold shadow-sm'
                  : isLight
                    ? 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                  ? isLight
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold shadow-sm'
                    : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold shadow-sm'
                  : isLight
                    ? 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <User size={16} />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      {/* Right: Theme Toggle + Extra Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isLight ? 'Black (Dark Mode)' : 'White (Light Mode)'}`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
            isLight
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/20'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
          }`}
        >
          {isLight ? (
            <>
              <Sun className="h-4 w-4 text-amber-500 animate-spin-slow" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {extraControls}
      </div>
    </header>
  )
}

