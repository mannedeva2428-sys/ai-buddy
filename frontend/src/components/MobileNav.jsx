import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'Assistant' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950/95 backdrop-blur border-t border-white/5 flex">
      {items.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 text-center py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-brand-300' : 'text-slate-500'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
