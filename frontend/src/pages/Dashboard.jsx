import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import MobileNav from '../components/MobileNav'
import VoiceOrb from '../components/VoiceOrb'
import ParticleCanvas from '../components/ParticleCanvas'
import TopNavigation from '../components/TopNavigation'
import { useSpeech } from '../hooks/useSpeech'
import { chatAPI } from '../services/api'

export default function Dashboard() {
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [particleCount, setParticleCount] = useState(70)
  const [particleSpeed, setParticleSpeed] = useState(1)
  const [connectDist, setConnectDist] = useState(120)
  const [showVectors, setShowVectors] = useState(true)
  const [showParticleSettings, setShowParticleSettings] = useState(false)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  const {
    isSupported,
    isTTSSupported,
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    listen,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech()

  // Reflect live transcript into the input box while listening
  useEffect(() => {
    if (isListening) setInputText(transcript)
  }, [transcript, isListening])

  // When recognition stops and we have text, auto-send it
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      handleSend(transcript)
      setTranscript('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      stopSpeaking()
      listen()
    }
  }

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? inputText).trim()
    if (!text || sending) return

    setSending(true)
    setInputText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Optimistically show the user's message
    const tempUserMsg = { id: `temp-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const res = await chatAPI.sendMessage({ message: text, conversation_id: conversationId })
      const [userMsg, aiMsg] = res.data

      setConversationId(userMsg.conversation_id)

      // Stream the AI response text letter by letter for a smooth typewriter effect
      const aiMsgId = aiMsg.id || `ai-${Date.now()}`
      const fullText = aiMsg.content || ''
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        userMsg,
        { ...aiMsg, id: aiMsgId, content: '' },
      ])

      let currentText = ''
      for (let i = 0; i < fullText.length; i++) {
        currentText += fullText[i]
        const textSnapshot = currentText
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: textSnapshot } : m))
        )
        await new Promise((resolve) => setTimeout(resolve, 15))
      }

      if (autoSpeak && isTTSSupported) {
        speak(fullText)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't reach the server. Please check your connection and try again.",
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearChat = () => {
    if (isSpeaking) stopSpeaking()
    if (isListening) stopListening()
    setMessages([])
    setConversationId(null)
  }

  const orbState = isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'

  const extraControls = (
    <>
      {/* Particle Settings Dropdown/Drawer */}
      <div className="relative">
        <button
          onClick={() => setShowParticleSettings(!showParticleSettings)}
          className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          title="Adjust Particle Background Settings"
        >
          <SparklesIcon className="h-3.5 w-3.5 text-purple-400" />
          <span className="hidden md:inline">Particles</span>
        </button>

        {showParticleSettings && (
          <div className="absolute right-0 top-10 w-64 p-4 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-xl shadow-2xl z-50 text-xs space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <SparklesIcon className="h-3.5 w-3.5 text-purple-400" />
                Particle Controls
              </span>
              <button
                onClick={() => setShowParticleSettings(false)}
                className="text-slate-400 hover:text-white text-sm leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Particle Count</span>
                <span className="font-mono text-purple-300 font-semibold">{particleCount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Speed Multiplier</span>
                <span className="font-mono text-purple-300 font-semibold">{particleSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={particleSpeed}
                onChange={(e) => setParticleSpeed(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Connection Distance</span>
                <span className="font-mono text-purple-300 font-semibold">{connectDist}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={connectDist}
                onChange={(e) => setConnectDist(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="pt-1 border-t border-white/10 flex items-center gap-2">
              <input
                type="checkbox"
                id="show-vectors"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="accent-purple-500 rounded cursor-pointer"
              />
              <label htmlFor="show-vectors" className="text-slate-300 cursor-pointer select-none">
                Show Velocity Vectors (v)
              </label>
            </div>
          </div>
        )}
      </div>

      {messages.length > 0 && (
        <button
          onClick={handleClearChat}
          className="text-xs text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/5 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          title="Clear conversation"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Clear</span>
        </button>
      )}

      <label className="flex items-center gap-1.5 text-xs text-slate-300 select-none cursor-pointer group">
        <span className="text-slate-400 group-hover:text-slate-200 transition hidden lg:inline">Auto-read</span>
        <button
          type="button"
          role="switch"
          aria-checked={autoSpeak}
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            autoSpeak ? 'bg-purple-600' : 'bg-slate-800'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              autoSpeak ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </label>
    </>
  )

  return (
    <div className="relative min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] flex text-slate-100 overflow-hidden">
      {/* Interactive Canvas Particle Background */}
      <ParticleCanvas
        count={particleCount}
        speed={particleSpeed}
        connectDist={connectDist}
        showVectors={showVectors}
      />

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Navigation */}
        <TopNavigation isListening={isListening} isSpeaking={isSpeaking} extraControls={extraControls} />

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-4 md:px-8 py-6 pb-40 md:pb-6">
          {messages.length === 0 ? (
            <EmptyState
              isSupported={isSupported}
              onSelectPrompt={(text) => handleSend(text)}
              orbState={orbState}
              onOrbClick={handleMicClick}
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => (
                <ChatBubble
                  key={m.id}
                  id={m.id}
                  role={m.role}
                  content={m.content}
                  onCopy={() => handleCopy(m.id, m.content)}
                  isCopied={copiedId === m.id}
                  onSpeak={() => speak(m.content)}
                  isTTSSupported={isTTSSupported}
                />
              ))}
              {sending && <TypingBubble />}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-white/10 px-4 md:px-8 py-4 pb-20 md:pb-5 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-slate-900/90 border border-white/15 rounded-2xl px-4 py-3 shadow-inner focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={isListening ? 'Listening to voice input...' : 'Type a message or use voice...'}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-28 min-h-[24px] py-1 leading-relaxed"
              />

              {/* Inline Microphone Action Button */}
              <button
                onClick={handleMicClick}
                disabled={!isSupported}
                className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                  isListening
                    ? 'text-pink-400 bg-pink-500/20 animate-pulse ring-1 ring-pink-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={isListening ? 'Stop listening' : 'Toggle Voice Recording'}
              >
                <MicIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || sending}
                className="p-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white disabled:opacity-20 disabled:hover:bg-brand-500 transition shadow-md shadow-brand-500/20 shrink-0"
                aria-label="Send message"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>

            <VoiceOrbSmall
              state={orbState}
              onClick={handleMicClick}
              disabled={!isSupported}
            />
          </div>
          {!isSupported && (
            <p className="text-center text-xs text-slate-500 mt-2 max-w-2xl mx-auto">
              Speech-to-text isn't supported in this browser. Try Chrome or Edge, or type your message above.
            </p>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

function VoiceOrbSmall({ state, onClick, disabled }) {
  return (
    <div className="shrink-0">
      <VoiceOrb size={48} state={state} onClick={onClick} disabled={disabled} />
    </div>
  )
}

function EmptyState({ isSupported, onSelectPrompt, orbState, onOrbClick }) {
  const promptSuggestions = [
    { title: '⏰ Current Time & Date', text: 'What is the current time and date?' },
    { title: '😄 Tell Me a Joke', text: 'Tell me a programming joke' },
    { title: '🎧 Music Recommendation', text: 'Recommend some good focus music' },
    { title: '📡 Daily News Update', text: 'What is the news today?' },
    { title: '💡 Brainstorm Ideas', text: 'Give me 5 creative ideas for a voice assistant app' },
    { title: '✨ Motivation Quote', text: 'Give me an inspiring quote' },
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
      <div className="mb-6 relative">
        <VoiceOrb state={orbState} onClick={onOrbClick} disabled={!isSupported} />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-ping" />
        Voice-first Intelligence
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">
        How can I help you today?
      </h2>
      <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
        {isSupported
          ? 'Tap the microphone orb to speak naturally, or pick a prompt suggestion below.'
          : 'Type your prompt in the box below to start chatting.'}
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-xl w-full">
        {promptSuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.text)}
            className="text-left p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-brand-500/40 transition-all duration-200 group flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-white group-hover:text-brand-300 transition">
              {item.title}
            </span>
            <span className="text-xs text-slate-400 line-clamp-2 mt-1 font-light">
              "{item.text}"
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatBubble({ id, role, content, onCopy, isCopied, onSpeak, isTTSSupported }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md shadow-brand-500/20">
          AI
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-brand-500/10'
              : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-xs shadow-lg shadow-black/20 backdrop-blur-sm'
          }`}
        >
          {content}
        </div>

        {/* Message Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onCopy}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded transition"
              title="Copy text"
            >
              {isCopied ? (
                <>
                  <CheckIcon className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
            {isTTSSupported && (
              <button
                onClick={onSpeak}
                className="text-xs text-slate-400 hover:text-brand-300 flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded transition"
                title="Speak message aloud"
              >
                <VolumeIcon className="h-3 w-3" />
                <span>Speak</span>
              </button>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-medium text-xs shrink-0">
          You
        </div>
      )}
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex gap-3 justify-start items-center">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
        AI
      </div>
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Assistant thinking</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CopyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VolumeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
    </svg>
  )
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 3v4" strokeLinecap="round" />
      <path d="M19 17v4" strokeLinecap="round" />
      <path d="M3 5h4" strokeLinecap="round" />
      <path d="M17 19h4" strokeLinecap="round" />
    </svg>
  )
}

function SoundWaveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M2 10v4" strokeLinecap="round" />
      <path d="M6 6v12" strokeLinecap="round" />
      <path d="M10 3v18" strokeLinecap="round" />
      <path d="M14 7v10" strokeLinecap="round" />
      <path d="M18 9v6" strokeLinecap="round" />
      <path d="M22 11v2" strokeLinecap="round" />
    </svg>
  )
}

function MicIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}



