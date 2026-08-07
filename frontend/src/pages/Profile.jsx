import { useState } from 'react'
import { Sun, Moon, Check } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import MobileNav from '../components/MobileNav'
import TopNavigation from '../components/TopNavigation'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { userAPI } from '../services/api'

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'

  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [color, setColor] = useState(user?.avatar_color || '#6366f1')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await userAPI.updateMe({ name, bio, avatar_color: color })
      updateUser(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-white'}`}>
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto chat-scroll pb-24 md:pb-6">
        <TopNavigation />

        <div className="max-w-lg mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col items-center mb-8">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg"
              style={{ backgroundColor: color }}
            >
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex gap-2 mt-4">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? `ring-2 ring-indigo-500 ring-offset-2 ${isLight ? 'ring-offset-slate-50' : 'ring-offset-slate-950'} scale-110` : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSave} className={`border rounded-2xl p-6 space-y-6 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-white/5 shadow-xl'
          }`}>
            <div>
              <h2 className={`text-base font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>Appearance & Theme</h2>
              <p className={`text-xs mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Choose between White (Light) mode or Black (Dark) mode for your interface.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Black / Dark Option */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                      : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/60'
                        : 'bg-slate-800/40 border-white/10 text-slate-400 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-xs">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <span>Black (Dark)</span>
                    {theme === 'dark' && <Check className="h-3.5 w-3.5 text-indigo-400 ml-auto" />}
                  </div>
                </button>

                {/* White / Light Option */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 border-indigo-500 text-slate-900 ring-2 ring-indigo-500/30'
                      : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/60'
                        : 'bg-slate-800/40 border-white/10 text-slate-400 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-xs">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>White (Light)</span>
                    {theme === 'light' && <Check className="h-3.5 w-3.5 text-indigo-600 ml-auto" />}
                  </div>
                </button>
              </div>
            </div>

            <hr className={isLight ? 'border-slate-200' : 'border-white/10'} />

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800/70 border-white/10 text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm cursor-not-allowed ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800/40 border-white/5 text-slate-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us a little about yourself…"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-800/70 border-white/10 text-white placeholder-slate-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-500/20"
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
            </button>
          </form>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

