import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Activity,
  TrendingUp,
  Lightbulb,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { widgetsAPI } from '../services/api'

const STAGGER = 0.06
const BASE_DELAY = 0.3

function getWeatherIcon(condition = '') {
  const cond = condition.toLowerCase()
  if (cond.includes('rain') || cond.includes('drizzle')) return CloudRain
  if (cond.includes('snow') || cond.includes('ice') || cond.includes('sleet')) return CloudSnow
  if (cond.includes('thunder') || cond.includes('storm')) return CloudLightning
  if (cond.includes('cloud') || cond.includes('overcast')) return Cloud
  return Sun
}

// ─── Weather Widget ──────────────────────────────────────────
function WeatherWidget() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [city, setCity] = useState('Bangalore')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState({
    city: 'Bangalore',
    country: 'India',
    temp_celsius: 26,
    condition: 'Mostly Sunny',
    humidity_percent: 64,
    high_temp: 28,
    low_temp: 21,
    forecast: [
      { day: 'Mon', temp: 24, condition: 'Sunny' },
      { day: 'Tue', temp: 26, condition: 'Sunny' },
      { day: 'Wed', temp: 23, condition: 'Cloudy' },
      { day: 'Thu', temp: 25, condition: 'Sunny' },
      { day: 'Fri', temp: 22, condition: 'Cloudy' },
    ],
  })

  const loadWeather = async (targetCity) => {
    setLoading(true)
    try {
      const res = await widgetsAPI.getWeather(targetCity)
      if (res.data) {
        setWeather(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeather(city)
  }, [city])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setCity(searchQuery.trim())
      setIsSearching(false)
      setSearchQuery('')
    }
  }

  const MainIcon = getWeatherIcon(weather.condition)

  return (
    <WidgetShell delay={BASE_DELAY} title="Weather" icon={Sun} accent="#fbbf24">
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-amber-400">
          <span>{weather.city}{weather.country ? `, ${weather.country}` : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Change City"
          >
            <Search className="w-3 h-3" />
          </button>
          <button
            onClick={() => loadWeather(city)}
            className={`p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition ${loading ? 'animate-spin' : ''}`}
            title="Refresh Weather"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isSearching && (
        <form onSubmit={handleSearch} className="mb-3 flex gap-1">
          <input
            type="text"
            placeholder="Enter city (e.g. Tokyo)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-slate-900/60 border border-amber-500/30 rounded text-white focus:outline-none focus:border-amber-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded transition"
          >
            Go
          </button>
        </form>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MainIcon className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className={`text-xl font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {weather.temp_celsius}°C
            </div>
            <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {weather.condition}
            </div>
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-500 font-mono">
          <div>H:{weather.high_temp}° L:{weather.low_temp}°</div>
          <div>Humidity {weather.humidity_percent}%</div>
        </div>
      </div>

      <div className="flex justify-between pt-1 border-t border-white/5">
        {(weather.forecast || []).map(({ day, temp, condition }, idx) => {
          const DayIcon = getWeatherIcon(condition)
          return (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-slate-500 font-mono">{day}</span>
              <DayIcon className="w-3 h-3 text-amber-400/80" />
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {temp}°
              </span>
            </div>
          )
        })}
      </div>
    </WidgetShell>
  )
}

// ─── Clock Widget ─────────────────────────────────────────────
function ClockWidget() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(i)
  }, [])
  const hours = time.getHours()
  const mins = time.getMinutes()
  const secs = time.getSeconds()
  const hourAngle = (hours % 12) * 30 + mins * 0.5
  const minAngle = mins * 6
  const secAngle = secs * 6

  return (
    <WidgetShell delay={BASE_DELAY + STAGGER} title="Time & Date" icon={Clock} accent="#22d3ee">
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="2" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="50" y1="6" x2="50" y2="10"
                stroke="rgba(34,211,238,0.3)"
                strokeWidth="1.5"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
            <line
              x1="50" y1="50" x2="50" y2="28"
              stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round"
              transform={`rotate(${hourAngle} 50 50)`}
            />
            <line
              x1="50" y1="50" x2="50" y2="20"
              stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"
              transform={`rotate(${minAngle} 50 50)`}
            />
            <line
              x1="50" y1="55" x2="50" y2="18"
              stroke="#d946ef" strokeWidth="1" strokeLinecap="round"
              transform={`rotate(${secAngle} 50 50)`}
            />
            <circle cx="50" cy="50" r="3" fill="#22d3ee" />
          </svg>
        </div>
        <div>
          <div className={`text-xl font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="text-[10px] text-cyan-500/80 mt-1 font-mono">UTC+05:30 · IST</div>
        </div>
      </div>
    </WidgetShell>
  )
}

// ─── AI Usage Widget ──────────────────────────────────────────
function AIUsageWidget() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [progress, setProgress] = useState(0)
  const target = 73
  useEffect(() => {
    const start = performance.now()
    const dur = 1800
    let raf = 0
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased * target)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const r = 30
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <WidgetShell delay={BASE_DELAY + STAGGER * 2} title="AI Usage" icon={Sparkles} accent="#8b5cf6">
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r={r} fill="none"
              stroke="url(#usageGrad)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.5))' }}
            />
            <defs>
              <linearGradient id="usageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-base font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className={`text-xs mb-0.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Daily Quota</div>
          <div className="text-[10px] text-slate-500 font-mono">730 / 1000 requests</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs yesterday</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}

// ─── Tasks Widget ─────────────────────────────────────────────
function TasksWidget() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review AI model output', done: false },
    { id: 2, text: 'Prepare meeting notes',  done: true  },
    { id: 3, text: 'Send weekly report',      done: false },
    { id: 4, text: 'Update dashboard UI',     done: false },
  ])
  const toggle = (id) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  return (
    <WidgetShell delay={BASE_DELAY + STAGGER * 3} title="My Tasks" icon={CheckCircle2} accent="#34d399">
      <div className="space-y-1.5 max-h-28 overflow-y-auto chat-scroll pr-1">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggle(task.id)}
            className="flex items-center gap-2 w-full text-left group cursor-pointer"
          >
            {task.done ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400/80 transition-colors flex-shrink-0" />
            )}
            <span className={`text-[11px] truncate ${
              task.done
                ? 'text-slate-400 line-through'
                : isLight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              {task.text}
            </span>
          </button>
        ))}
      </div>
    </WidgetShell>
  )
}

// ─── Voice Analytics Widget ───────────────────────────────────
function VoiceAnalyticsWidget() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let phase = 0
    const bars = 26
    const render = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      phase += 0.06
      const bw = w / bars
      for (let i = 0; i < bars; i++) {
        const t = phase + i * 0.25
        const amp = (Math.sin(t) * 0.3 + Math.sin(t * 2.1) * 0.2 + 0.4) * (0.4 + Math.random() * 0.6)
        const bh = amp * h
        const x = i * bw
        const y = (h - bh) / 2
        const grad = ctx.createLinearGradient(0, y, 0, y + bh)
        grad.addColorStop(0, 'rgba(167,139,250,0.9)')
        grad.addColorStop(1, 'rgba(34,211,238,0.5)')
        ctx.fillStyle = grad
        ctx.fillRect(x + 1, y, bw - 2, bh)
      }
      raf = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <WidgetShell delay={BASE_DELAY + STAGGER * 4} title="Voice Analytics" icon={Activity} accent="#d946ef">
      <canvas ref={canvasRef} width={240} height={50} className="w-full h-12" />
      <div className="flex justify-between mt-2 text-[10px] font-mono border-t border-white/5 pt-1">
        <div>
          <span className="text-slate-500">Pitch </span>
          <span className="text-fuchsia-400 font-bold">440Hz</span>
        </div>
        <div>
          <span className="text-slate-500">Clarity </span>
          <span className="text-cyan-400 font-bold">94%</span>
        </div>
        <div>
          <span className="text-slate-500">WPM </span>
          <span className="text-violet-400 font-bold">148</span>
        </div>
      </div>
    </WidgetShell>
  )
}

// ─── Voice Commands & Suggestions Widget ───────────────────────
function SuggestionsWidget({ onSelectPrompt }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const suggestions = [
    '🎤 What is your name?',
    '🎤 Who is your owner?',
    '🎤 Tell me the time',
    '🎤 Tell me the date',
    '🎤 What day is today?',
    '🎤 Which month is this?',
    '🎤 What year is it?',
    '🎤 Tell me a joke',
    '🎤 Give me daily motivation',
    '🎤 What is the weather forecast?',
    '🎤 Summarize my emails',
    '🎤 Draft a project update',
    '🎤 Give me presentation ideas',
    '🎤 Open YouTube',
    '🎤 Open Spotify',
    '🎤 Open WhatsApp Web',
    '🎤 Open GitHub',
    '🎤 Open Discord',
    '🎤 Open Reddit',
    '🎤 Open Figma',
    '🎤 Open Netflix',
    '🎤 Open LinkedIn',
    '🎤 Open Twitter',
    '🎤 Open Notion',
    '🎤 Open Canva',
    '🎤 Open Stack Overflow',
    '🎤 Open Amazon',
    '🎤 Open Wikipedia',
    '🎤 Open Medium',
    '🎤 Open Dev.to',
    '🎤 Calculate 25 * 4',
    '🎤 Check system health status',
    '🎤 Write a Python script',
    '🎤 Write JavaScript code',
    '🎤 Write HTML template',
    '🎤 Explain React Hooks',
    '🎤 Explain REST API',
    '🎤 Explain MongoDB',
    '🎤 Show Git commands',
    '🎤 Explain Docker',
    '🎤 Create a daily schedule',
    '🎤 Draft a resignation letter',
    '🎤 Draft a cold email',
    '🎤 Create meeting agenda',
    '🎤 How to boost productivity?',
    '🎤 Flip a coin',
    '🎤 Roll a dice',
    '🎤 Tell me a fun fact',
    '🎤 Tell me a riddle',
    '🎤 Sing a song',
    '🎤 Tell me a story',
    '🎤 What is AI?',
    '🎤 What is Machine Learning?',
    '🎤 What is Quantum Computing?',
    '🎤 Read top news',
    '🎤 Set a reminder',
    '🎤 Who created you?',
    '🎤 Give me quotes',
    '🎤 Show system specs',
    '🎤 Say hello',
  ]

  return (
    <WidgetShell delay={BASE_DELAY + STAGGER * 5} title="Voice Commands (60)" icon={Lightbulb} accent="#60a5fa">
      <div className="space-y-1.5 max-h-36 overflow-y-auto chat-scroll pr-1">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 3 }}
            onClick={() => onSelectPrompt && onSelectPrompt(s.replace(/^🎤\s*/, ''))}
            className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-indigo-50/70 border-indigo-100 hover:border-indigo-300 text-slate-800'
                : 'bg-purple-950/30 border-purple-900/20 hover:border-purple-600/40 text-slate-300'
            }`}
          >
            <Lightbulb className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] truncate">{s}</span>
          </motion.button>
        ))}
      </div>
    </WidgetShell>
  )
}

// ─── Widget Shell ─────────────────────────────────────────────
function WidgetShell({
  title,
  icon: Icon,
  accent,
  delay,
  children,
}) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={`rounded-2xl p-3.5 relative overflow-hidden group shadow-lg border transition-all ${
        isLight
          ? 'bg-white/85 border-slate-200 shadow-slate-200/50 hover:border-indigo-300'
          : 'glass-panel glass-panel-hover border-white/10'
      }`}
    >
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between mb-2.5 relative">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
      </div>
      <div className="relative">{children}</div>
    </motion.div>
  )
}

// ─── Exported Grid Tray ───────────────────────────────────────
export default function Widgets({ onSelectPrompt }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-[1650px] mx-auto">
      <WeatherWidget />
      <ClockWidget />
      <AIUsageWidget />
      <TasksWidget />
      <VoiceAnalyticsWidget />
      <SuggestionsWidget onSelectPrompt={onSelectPrompt} />
    </div>
  )
}
