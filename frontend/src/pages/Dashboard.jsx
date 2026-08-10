import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Sparkles,
  Activity,
  Cpu,
  Zap,
  Radio,
  Brain,
  Waves,
  Terminal,
  Globe,
  Shield,
  ChevronRight,
  Power,
  Wifi,
  Database,
  Settings,
  Gauge,
  Clock,
  ExternalLink,
  Search,
  Bell,
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Plus,
  Send,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import MobileNav from '../components/MobileNav'
import TopNavigation from '../components/TopNavigation'
import Orb from '../components/Orb'
import LeftPanel from '../components/LeftPanel'
import AudioSpectrum from '../components/AudioSpectrum'
import Widgets from '../components/Widgets'
import { useAudioLevel } from '../hooks/useAudioLevel'
import { useSpeech } from '../hooks/useSpeech'
import { useTheme } from '../context/ThemeContext'
import { chatAPI } from '../services/api'

// ─── Cursor Spotlight ─────────────────────────────────────────
function CursorSpotlight() {
  const { theme } = useTheme()
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current) {
        const glowColor = theme === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(34, 211, 238, 0.06)'
        ref.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, ${glowColor}, transparent 40%)`
      }
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [theme])
  return <div ref={ref} className="pointer-events-none fixed inset-0 z-30 transition-all duration-300" />
}

// ─── Click Ripple ─────────────────────────────────────────────
function Ripple({ x, y, id }) {
  const { theme } = useTheme()
  const borderColor = theme === 'light' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(34, 211, 238, 0.5)'
  return (
    <motion.div
      key={id}
      className="pointer-events-none fixed z-40 rounded-full"
      style={{
        left: x,
        top: y,
        x: '-50%',
        y: '-50%',
        border: `2px solid ${borderColor}`,
      }}
      initial={{ width: 0, height: 0, opacity: 0.8 }}
      animate={{ width: 300, height: 300, opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  )
}


// ─── Ripple Waves for Listening State ─────────────────────────
function DashboardRipples({ active }) {
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-400/20"
          initial={{ width: 200, height: 200, opacity: 0.4 }}
          animate={{ width: 800, height: 800, opacity: 0 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

const WEB_SHORTCUTS = [
  { keywords: ['youtube', 'yt'], url: 'https://www.youtube.com', name: 'YouTube', icon: '📺' },
  { keywords: ['spotify', 'music'], url: 'https://open.spotify.com', name: 'Spotify', icon: '🎵' },
  { keywords: ['google'], url: 'https://www.google.com', name: 'Google', icon: '🔍' },
  { keywords: ['gmail'], url: 'https://mail.google.com', name: 'Gmail', icon: '✉️' },
  { keywords: ['whatsapp'], url: 'https://web.whatsapp.com', name: 'WhatsApp', icon: '💬' },
]

function autoOpenWebShortcut(userText, aiText) {
  const combined = ((userText || '') + ' ' + (aiText || '')).toLowerCase()
  if (!combined.trim()) return null

  for (const shortcut of WEB_SHORTCUTS) {
    const matched = shortcut.keywords.some((kw) => {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      return regex.test(combined)
    })
    if (matched) {
      try {
        window.open(shortcut.url, '_blank', 'noopener,noreferrer')
      } catch (e) {
        console.error('Failed to open tab:', e)
      }
      return shortcut.url
    }
  }

  const match = aiText && aiText.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/)
  if (match && match[1]) {
    try {
      window.open(match[1], '_blank', 'noopener,noreferrer')
    } catch (e) {
      console.error('Failed to open link:', e)
    }
    return match[1]
  }

  return null
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  const [mode, setMode] = useState('idle')
  const [ripples, setRipples] = useState([])
  const [showTooltip, setShowTooltip] = useState(false)

  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: "Hello Deva! I am AI Buddy. How can I help you today?" },
  ])
  const [conversationId, setConversationId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [bootDone, setBootDone] = useState(false)
  const [time, setTime] = useState(new Date())
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [showWidgets, setShowWidgets] = useState(true)

  const mouseRef = useRef({ x: 0, y: 0 })
  const rippleId = useRef(0)
  const chatScrollRef = useRef(null)
  const textareaRef = useRef(null)
  const searchInputRef = useRef(null)

  const { audioLevel, isActive: isAudioActive, start: startAudio, stop: stopAudio } = useAudioLevel()
  const {
    isSupported,
    isTTSSupported,
    isSecureOrigin,
    isListening,
    isSpeaking,
    transcript,
    error: speechError,
    setError: setSpeechError,
    setTranscript,
    listen,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech()

  // Boot sequence animation
  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Clock ticker
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Reflect voice STT transcript into text box
  useEffect(() => {
    if (isListening) {
      setInputText(transcript)
      setMode('listening')
    }
  }, [transcript, isListening])

  // Send message automatically when user stops speaking
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      sendMessage(transcript)
      setTranscript('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening])

  // Mouse tracking for 3D Robot & Orb interaction
  const handleMouseMove = useCallback((e) => {
    const { innerWidth, innerHeight } = window
    mouseRef.current = {
      x: (e.clientX / innerWidth) * 2 - 1,
      y: -(e.clientY / innerHeight) * 2 + 1,
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Auto-scroll chat box to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, sending])

  const handleClick = (e) => {
    const id = ++rippleId.current
    setRipples((prev) => [...prev, { x: e.clientX, y: e.clientY, id }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 800)
  }

  const toggleMic = () => {
    if (isListening) {
      stopListening()
      stopAudio()
      setMode('idle')
    } else {
      stopSpeaking()
      listen()
      startAudio()
      setMode('listening')
    }
  }

  const sendMessage = useCallback(
    async (textToSend) => {
      const text = (textToSend || inputText).trim()
      if (!text || sending) return

      setInputText('')
      setSending(true)
      setMode('thinking')

      const tempUserMsg = { id: `user-${Date.now()}`, role: 'user', text }
      setMessages((prev) => [...prev, tempUserMsg])

      try {
        const res = await chatAPI.sendMessage({ message: text, conversation_id: conversationId })
        const [userMsgDoc, aiMsgDoc] = res.data

        setConversationId(userMsgDoc.conversation_id)
        setMode('speaking')

        const aiMsg = {
          id: aiMsgDoc.id || `ai-${Date.now()}`,
          role: 'ai',
          text: aiMsgDoc.content || '',
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), { ...userMsgDoc, role: 'user', text: userMsgDoc.content }, aiMsg])

        if (autoSpeak && isTTSSupported) {
          speak(aiMsg.text)
        }

        autoOpenWebShortcut(text, aiMsg.text)
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'ai',
            text: "Hello Deva! I am AI Buddy. Running smoothly and ready to help you!",
          },
        ])
      } finally {
        setSending(false)
        setTimeout(() => setMode('idle'), 3500)
      }
    },
    [inputText, sending, conversationId, autoSpeak, isTTSSupported, speak]
  )

  const latestAiMessage = messages.filter((m) => m.role === 'ai').pop()?.text || "Hello Deva! 👋 I'm your AI Buddy. How can I help you today?"

  return (
    <div className={`relative w-full h-screen overflow-hidden flex transition-colors ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#07090e] text-slate-100'
      }`} onClick={handleClick}>
      {/* ─── 3D Three.js Dual Hero Stage Canvas ─── */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0.4, 5.8], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={isLight ? 1.0 : 0.6} />
            <directionalLight position={[5, 8, 5]} intensity={isLight ? 2.0 : 1.6} color={isLight ? '#ffffff' : '#e0f2fe'} castShadow />
            <pointLight position={[-4, 3, -2]} intensity={2.2} color={isLight ? '#3b82f6' : '#0284c7'} />
            <pointLight position={[0, -1, 2]} intensity={1.5} color={isLight ? '#6366f1' : '#00f3ff'} />
            <pointLight position={[3, 2, 2]} intensity={1.8} color="#8b5cf6" />

            {/* Centered 3D Neural Orb */}
            <group position={[0, 0.15, 0]}>
              <Orb mode={mode} audioLevel={audioLevel} mouse={mouseRef} clicked={isListening} scale={0.9} />
              {/* Multi-tiered Glowing Ring Pedestal under Orb */}
              <group position={[0, -1.15, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[1.2, 1.45, 0.15, 64]} />
                  <meshStandardMaterial color={isLight ? '#cbd5e1' : '#050b14'} roughness={0.2} metalness={0.9} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                  <ringGeometry args={[0.85, 1.15, 64]} />
                  <meshBasicMaterial color="#8b5cf6" transparent opacity={0.85} />
                </mesh>
              </group>
            </group>

            <EffectComposer>
              <Bloom intensity={isLight ? 0.8 : 1.3} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
              <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0005, 0.0005]} />
              <Vignette eskil={false} offset={0.3} darkness={isLight ? 0.3 : 0.8} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* Click Ripples */}
      {ripples.map((r) => (
        <Ripple key={r.id} x={r.x} y={r.y} id={r.id} />
      ))}

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Viewport */}
      <motion.div
        className="relative z-20 flex-1 flex flex-col h-screen overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: bootDone ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Top Header Navigation */}
        <div className={`border-b backdrop-blur-xl px-6 py-2.5 flex items-center justify-between gap-4 transition-colors ${isLight ? 'border-slate-200 bg-white/85 text-slate-800' : 'border-white/10 bg-slate-950/80 text-white'
          }`}>
          {speechError && (
            <div className="absolute top-16 left-6 right-6 z-50 p-3 bg-gradient-to-r from-red-600/90 to-amber-600/90 text-white rounded-xl shadow-xl flex items-center justify-between text-xs backdrop-blur-md animate-fade-in border border-white/20">
              <div className="flex items-center gap-2 pr-4">
                <span className="text-base">⚠️</span>
                <span>{speechError}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {typeof window !== 'undefined' && window.location.protocol === 'http:' && (
                  <a
                    href={window.location.href.replace('http:', 'https:')}
                    className="px-3 py-1 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-bold transition shadow-sm"
                  >
                    Switch to HTTPS 🔒
                  </a>
                )}
                <button
                  onClick={() => setSpeechError(null)}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg text-sm font-display">
              AI
            </div>
            <div>
              <div className={`text-sm font-bold flex items-center gap-2 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                AI Buddy
                <span className={`text-[10px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Voice Assistant</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online & Ready
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs border w-72 focus-within:border-indigo-500 shadow-inner transition-colors ${isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-white/15 text-slate-300'
            }`}>
            <Search className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search anything..."
              className={`bg-transparent outline-none flex-1 text-xs font-mono ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
            />
            <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-slate-400'}`}>Ctrl K</kbd>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            {typeof window !== 'undefined' && window.location.protocol === 'http:' && (
              <a
                href={window.location.href.replace('http:', 'https:')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition animate-pulse"
                title="Click to switch to HTTPS to enable microphone access over network IP"
              >
                <span>Switch to HTTPS 🔒</span>
              </a>
            )}

            <button
              onClick={toggleTheme}
              title={`Switch to ${isLight ? 'Black (Dark Mode)' : 'White (Light Mode)'}`}
              className={`p-2 rounded-full border transition cursor-pointer ${isLight ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                }`}
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <button className={`p-2 rounded-full border transition ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}>
              <Settings className="w-4 h-4 text-indigo-500" />
            </button>

            <div className="relative">
              <button className={`p-2 rounded-full border transition ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                }`}>
                <Bell className="w-4 h-4 text-purple-500" />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center shadow-md">
                3
              </span>
            </div>

            <div className={`hidden lg:flex items-center gap-2 text-xs font-mono border-l pl-3 ${isLight ? 'text-indigo-600 border-slate-200' : 'text-cyan-300 border-white/10'
              }`}>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            {/* Small Robot Avatar Icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400/40 p-0.5 shadow-lg flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid (3 Columns: LeftPanel, Center Globe, Right Chat) */}
        <div className="flex-1 grid grid-cols-12 gap-4 px-6 py-3 min-h-0 overflow-hidden max-w-[1650px] mx-auto w-full">
          {/* Left Column: Welcome Card + Quick Actions */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 min-h-0 h-full">
            <LeftPanel
              onNewChat={() => {
                setMessages([
                  { id: Date.now(), role: 'ai', text: "Hello Deva! 👋 I've started a new conversation for you. How can I assist you today?" },
                ])
                setConversationId(null)
              }}
              onVoiceCommand={toggleMic}
              onUploadDoc={() => sendMessage('Analyze my uploaded document')}
              onSearch={() => searchInputRef.current?.focus()}
            />
          </div>

          {/* Center Column: 3D Orb Globe Stage */}
          <main className="col-span-12 lg:col-span-4 xl:col-span-5 flex flex-col justify-between relative min-h-0 py-2">
            <DashboardRipples active={mode === 'listening'} />

            {/* Top Waveform Header over Globe Stage */}
            <div className="flex flex-col items-center gap-1 z-20">
              <div className={`px-3.5 py-1 rounded-full border text-xs font-mono shadow-xl flex items-center gap-2 ${isLight ? 'bg-white/90 border-indigo-200 text-indigo-700' : 'bg-slate-950/80 border-cyan-500/30 text-cyan-300'
                }`}>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>AI Listening...</span>
              </div>
              <div className="w-48 h-8">
                <AudioSpectrum isActive={isListening || isSpeaking || sending} />
              </div>
            </div>

            {/* Floating Speech Bubble over Globe */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 max-w-xs z-20 pointer-events-none w-full px-4">
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`border backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs shadow-2xl leading-relaxed mx-auto ${isLight
                  ? 'bg-white/95 border-indigo-200 text-slate-800 shadow-indigo-500/10'
                  : 'bg-slate-900/90 border-cyan-500/40 text-cyan-100'
                  }`}
              >
                <div className={`text-[9px] font-mono uppercase tracking-wider mb-1 font-semibold ${isLight ? 'text-indigo-600' : 'text-cyan-400'
                  }`}>
                  Hello Deva! 👋
                </div>
                {latestAiMessage}
              </motion.div>
            </div>

            {/* Mode Action Pills under 3D Orb Stage */}
            <div className="flex items-center justify-center gap-3 z-20 mb-2">
              <button
                onClick={toggleMic}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 border shadow-lg cursor-pointer ${mode === 'listening'
                  ? 'bg-indigo-500/30 text-indigo-700 dark:text-cyan-300 border-indigo-400 shadow-indigo-500/20'
                  : isLight
                    ? 'bg-white/90 text-slate-700 border-slate-200 hover:border-indigo-400'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-cyan-500/40'
                  }`}
              >
                <Mic className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
                Listening
              </button>

              <button
                onClick={() => setMode('thinking')}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 border shadow-lg cursor-pointer ${mode === 'thinking'
                  ? 'bg-purple-500/30 text-purple-700 dark:text-purple-300 border-purple-400 shadow-purple-500/20'
                  : isLight
                    ? 'bg-white/90 text-slate-700 border-slate-200 hover:border-purple-400'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-purple-500/40'
                  }`}
              >
                <Brain className="w-3.5 h-3.5 text-purple-500" />
                Thinking
              </button>

              <button
                onClick={() => setMode('speaking')}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 border shadow-lg cursor-pointer ${mode === 'speaking'
                  ? 'bg-blue-500/30 text-blue-700 dark:text-blue-300 border-blue-400 shadow-blue-500/20'
                  : isLight
                    ? 'bg-white/90 text-slate-700 border-slate-200 hover:border-blue-400'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-blue-500/40'
                  }`}
              >
                <Waves className="w-3.5 h-3.5 text-blue-500" />
                Speaking
              </button>
            </div>
          </main>

          {/* Right Chat Panel */}
          <motion.aside
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-3 min-h-0 h-full"
          >
            {/* Top Web Shortcuts Row */}
            <div className="flex items-center gap-2 overflow-x-auto chat-scroll py-1 shrink-0">
              {WEB_SHORTCUTS.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs shrink-0 shadow-md ${isLight
                    ? 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    : 'bg-slate-900/80 border-white/10 text-slate-200 hover:text-white hover:bg-slate-800/90'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span className="font-mono text-[11px]">{item.name}</span>
                </a>
              ))}
              <button className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${isLight ? 'bg-white/90 border-slate-200 text-slate-500 hover:text-slate-900' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Box Panel */}
            <div className={`rounded-2xl p-4 flex-1 min-h-0 flex flex-col relative shadow-2xl border transition-colors ${isLight ? 'bg-white/90 border-slate-200 shadow-indigo-500/5' : 'glass-panel border-white/15 bg-slate-950/70'
              }`}>
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto chat-scroll space-y-3.5 pr-1">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-lg ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
                          : isLight
                            ? 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                            : 'bg-slate-900/95 border border-cyan-500/30 text-cyan-100 rounded-bl-none'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[9px] font-mono uppercase tracking-wider mb-1 opacity-70">
                          <span>{msg.role === 'user' ? 'You' : 'AI Buddy'}</span>
                          <span>10:51 AM</span>
                        </div>
                        <div>{msg.text}</div>
                        {msg.role === 'ai' && msg.text.includes('http') && (
                          <a
                            href={msg.text.match(/https?:\/\/[^\s]+/)?.[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono transition ${isLight
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                              : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30'
                              }`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Now
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {sending && (
                  <div className={`flex items-center gap-2 text-xs font-mono animate-pulse px-3 py-2 rounded-xl w-max border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-900/80 border-cyan-500/20 text-cyan-400'
                    }`}>
                    <span className="flex gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isLight ? 'bg-indigo-600' : 'bg-cyan-400'}`} />
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${isLight ? 'bg-indigo-600' : 'bg-cyan-400'}`} />
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${isLight ? 'bg-indigo-600' : 'bg-cyan-400'}`} />
                    </span>
                    <span>AI Buddy is responding...</span>
                  </div>
                )}
              </div>

              {/* Composer Input Bar */}
              <div className={`mt-3 pt-2 border-t flex items-center gap-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <div className={`flex-1 border focus-within:border-indigo-500 rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-inner transition-colors ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900/90 border-white/15'
                  }`}>
                  <input
                    ref={textareaRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Type a message or ask anything..."
                    className={`flex-1 bg-transparent text-xs outline-none font-mono ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
                      }`}
                  />
                  <button
                    onClick={toggleMic}
                    className={`p-1.5 rounded-xl transition cursor-pointer ${isListening
                      ? 'text-pink-500 bg-pink-500/20 animate-pulse'
                      : isLight
                        ? 'text-slate-400 hover:text-indigo-600'
                        : 'text-slate-400 hover:text-cyan-300'
                      }`}
                    title="Voice Mic"
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim() || sending}
                  className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white disabled:opacity-30 transition flex items-center justify-center shadow-lg shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Bottom Dashboard Grid Widgets */}
        <AnimatePresence>
          {showWidgets && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`border-t backdrop-blur-xl px-6 py-2.5 overflow-x-auto chat-scroll shadow-2xl shrink-0 z-20 transition-colors ${isLight ? 'border-slate-200 bg-white/90 text-slate-800' : 'border-white/10 bg-slate-950/80 text-white'
                }`}
            >
              <Widgets onSelectPrompt={(text) => sendMessage(text)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <MobileNav />
    </div>
  )
}
