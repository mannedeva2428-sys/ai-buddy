import { NavLink, useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Assistant', icon: MicIcon },
  { to: '/history', label: 'Chat History', icon: HistoryIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isLight = theme === 'light'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`hidden md:flex md:flex-col w-52 shrink-0 border-r backdrop-blur-xl px-4 py-5 justify-between z-20 transition-colors ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-white/10 text-white'
    }`}>
      <div>
        {/* Brand Logo Badge */}
        <div className="flex items-center justify-between px-1 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-indigo-500/20 shrink-0">
              AI
            </div>
            <span className={`font-semibold text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Voice Assistant
            </span>
          </div>
        </div>

        {/* Theme Quick Switcher in Sidebar */}
        <div className="mb-4">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
                : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              {isLight ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
              <span>{isLight ? 'White Theme' : 'Black Theme'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
              {theme}
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold shadow-sm'
                      : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold shadow-sm'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile Card at Bottom Left */}
      <div className={`border-t pt-4 mt-4 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="flex items-center gap-2.5 px-1">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow"
            style={{ backgroundColor: user?.avatar_color || '#6366f1' }}
          >
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold truncate leading-tight ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {user?.name || 'User'}
            </p>
            <p className={`text-[10px] truncate leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full text-left px-1 mt-2 text-[11px] font-medium transition-colors cursor-pointer ${
            isLight ? 'text-slate-500 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}



function MicIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" strokeLinecap="round" />
      <path d="M12 18v3" strokeLinecap="round" />
      <path d="M8 21h8" strokeLinecap="round" />
    </svg>
  )
}

function HistoryIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
      <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  )
}
