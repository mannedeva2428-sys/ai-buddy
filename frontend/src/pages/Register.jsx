import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { BackgroundGlow } from './Login'

export default function Register() {
  const { register } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <BackgroundGlow isLight={isLight} />

      {/* Top right theme toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-100' : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800'
        }`}
      >
        {isLight ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
        <span>{isLight ? 'White Theme' : 'Black Theme'}</span>
      </button>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-display font-bold text-white text-lg mb-4 shadow-lg shadow-indigo-500/30">
            AI
          </div>
          <h1 className={`font-display text-2xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Create your account</h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Set up your AI buddy</p>
        </div>

        <form onSubmit={handleSubmit} className={`border rounded-2xl p-6 space-y-4 backdrop-blur transition-all ${
          isLight ? 'bg-white/80 border-slate-200 shadow-xl shadow-indigo-500/5' : 'bg-slate-900/60 border-white/5'
        }`}>
          {error && (
            <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Full name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-800/70 border-white/10 text-white placeholder-slate-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-800/70 border-white/10 text-white placeholder-slate-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-800/70 border-white/10 text-white placeholder-slate-500'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-500/20"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
          Already have an account?{' '}
          <Link to="/login" className={`font-medium ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

