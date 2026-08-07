import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const items = [
  { to: '/dashboard', label: 'Assistant' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' },
]

export default function MobileNav() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 backdrop-blur border-t flex transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-700' : 'bg-slate-950/95 border-white/5 text-white'
    }`}>
      {items.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 text-center py-3 text-xs font-medium transition-colors ${
              isActive
                ? isLight ? 'text-indigo-600 font-bold' : 'text-brand-300 font-bold'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-500 hover:text-slate-300'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

