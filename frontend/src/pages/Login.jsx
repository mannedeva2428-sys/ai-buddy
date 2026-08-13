import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Moon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: 'deva@example.com', password: 'password123' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError(err.response.data?.detail || 'Invalid email or password.')
        } else {
          setError(err.response.data?.detail || `Server error (${err.response.status}). Please try again.`)
        }
      } else if (err.request) {
        setError('Unable to connect to the server. Please check your backend connection.')
      } else {
        setError(err.message || 'An error occurred during sign in.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setForm({ email: 'deva@example.com', password: 'password123' })
    setError('')
    setLoading(true)
    try {
      await login('deva@example.com', 'password123')
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password.')
      } else if (err.request) {
        setError('Unable to connect to the server. Please check your backend connection.')
      } else {
        setError(err.message || 'Demo login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors font-sans select-none ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#05070e] text-white'
    }`}>
      {/* ─── Ambient Glow Orbs ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl ${
          isLight ? 'bg-indigo-400/20' : 'bg-indigo-600/25'
        }`} />
        <div className={`absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl ${
          isLight ? 'bg-cyan-400/20' : 'bg-cyan-500/20'
        }`} />
      </div>

      {/* ─── Top Right Theme Toggle ─── */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all shadow-md ${
          isLight
            ? 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100'
            : 'bg-slate-900/90 border-white/10 text-slate-300 hover:bg-slate-800'
        }`}
      >
        {isLight ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
        <span>{isLight ? 'White Theme' : 'Black Theme'}</span>
      </button>

      {/* ─── Main Login Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 mb-4">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center font-display font-extrabold text-xl ${
              isLight ? 'bg-white text-indigo-600' : 'bg-slate-950 text-cyan-400'
            }`}>
              AI
            </div>
          </div>
          <h1 className={`font-display text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Welcome Back
          </h1>
          <p className={`text-xs mt-1.5 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Sign in to access your AI Voice Assistant & Dashboard
          </p>
        </div>

        {/* Form Panel */}
        <div className={`rounded-3xl p-7 border backdrop-blur-xl transition-all shadow-2xl ${
          isLight
            ? 'bg-white/90 border-slate-200/80 shadow-indigo-500/5'
            : 'glass-panel border-white/10 bg-slate-950/75'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {forgotSent && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password reset link sent to your email.</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className={`w-4 h-4 absolute left-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-2xl border pl-10 pr-4 py-2.5 text-xs font-mono outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'
                      : 'bg-slate-900/80 border-white/10 text-white focus:border-cyan-400 focus:bg-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="text-[11px] font-medium text-indigo-500 hover:text-indigo-400 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative flex items-center">
                <Lock className={`w-4 h-4 absolute left-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl border pl-10 pr-10 py-2.5 text-xs font-mono outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'
                      : 'bg-slate-900/80 border-white/10 text-white focus:border-cyan-400 focus:bg-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 p-1 rounded-lg transition ${
                    isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>Remember me</span>
              </label>

              <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <button
              onClick={handleDemoLogin}
              className={`w-full py-2.5 rounded-2xl border text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-white/5 border-white/10 text-cyan-300 hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Login (Deva)</span>
            </button>
          </div>
        </div>

        {/* Footer Link to Register */}
        <p className={`text-center text-xs mt-6 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Don't have an account?{' '}
          <Link
            to="/register"
            className={`font-semibold transition ${
              isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export function BackgroundGlow({ isLight }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl ${isLight ? 'bg-indigo-400/15' : 'bg-indigo-600/20'}`} />
      <div className={`absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl ${isLight ? 'bg-violet-400/15' : 'bg-violet-700/20'}`} />
    </div>
  )
}
