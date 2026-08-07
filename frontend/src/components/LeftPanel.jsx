import {
  MessageCircle,
  Mic,
  Upload,
  Search,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function LeftPanel({
  onNewChat,
  onVoiceCommand,
  onUploadDoc,
  onSearch,
}) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className="w-full max-w-sm space-y-3 flex flex-col min-h-0 overflow-y-auto chat-scroll pr-1 z-20">

      {/* Compact Welcome Card */}
      <div className={`rounded-2xl border p-3.5 shadow-md relative overflow-hidden group transition-colors ${
        isLight
          ? 'bg-white/90 border-slate-200 shadow-slate-200/50'
          : 'bg-[#111827]/90 border-cyan-500/20'
      }`}>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className={`text-base font-bold flex items-center gap-1.5 font-display ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>👋</span> Welcome back, Deva!
            </h2>
            <p className={`mt-0.5 text-[11px] leading-tight ${
              isLight ? 'text-slate-600' : 'text-gray-400'
            }`}>
              Your AI Assistant is ready today.
            </p>
          </div>

          {/* Compact Robot Avatar Badge */}
          <div className={`relative w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-inner transition-colors ${
            isLight
              ? 'bg-indigo-50 border-indigo-200'
              : 'bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border-cyan-500/30'
          }`}>
            <span className="text-xl hover:scale-110 transition-transform">🤖</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111827] shadow-lg animate-pulse" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className={isLight ? 'text-slate-600' : 'text-gray-400'}>Today's Progress</span>
            <span className="text-cyan-400 font-semibold">78%</span>
          </div>

          <div className={`mt-1 h-1.5 rounded-full overflow-hidden border ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-white/5'
          }`}>
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />
          </div>

          <p className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <span>🔥</span> Keep it up! You're doing great.
          </p>
        </div>

      </div>

      {/* Compact Quick Actions */}
      <div className={`rounded-2xl border p-3.5 shadow-md transition-colors ${
        isLight
          ? 'bg-white/90 border-slate-200 shadow-slate-200/50'
          : 'bg-[#111827]/90 border-cyan-500/20'
      }`}>

        <h3 className={`text-xs font-bold mb-2 font-display uppercase tracking-wider ${
          isLight ? 'text-slate-800' : 'text-cyan-400'
        }`}>
          Quick Actions
        </h3>

        <Action
          icon={<MessageCircle size={15} />}
          title="New Conversation"
          subtitle="Start a new chat"
          onClick={onNewChat}
          isLight={isLight}
        />

        <Action
          icon={<Mic size={15} />}
          title="Voice Command"
          subtitle="Speak to AI"
          onClick={onVoiceCommand}
          isLight={isLight}
        />

        <Action
          icon={<Upload size={15} />}
          title="Upload Document"
          subtitle="Analyze your files"
          onClick={onUploadDoc}
          isLight={isLight}
        />

        <Action
          icon={<Search size={15} />}
          title="Smart Search"
          subtitle="Find anything"
          onClick={onSearch}
          isLight={isLight}
        />

      </div>

    </div>
  )
}

function Action({
  icon,
  title,
  subtitle,
  onClick,
  isLight,
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-1.5 flex w-full items-center justify-between rounded-xl border p-2 transition cursor-pointer group text-left ${
        isLight
          ? 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-slate-100'
          : 'bg-slate-900/70 border-slate-700/80 hover:border-cyan-400 hover:bg-slate-800/90'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 p-1.5 text-white shadow-md group-hover:scale-105 transition-transform">
          {icon}
        </div>

        <div className="text-left">
          <h4 className={`text-[11px] font-semibold group-hover:text-cyan-400 transition-colors ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {title}
          </h4>

          <p className={`text-[9px] ${
            isLight ? 'text-slate-500' : 'text-gray-400'
          }`}>
            {subtitle}
          </p>
        </div>
      </div>

      <ChevronRight className="text-cyan-400 group-hover:translate-x-1 transition-transform" size={15} />
    </button>
  )
}
