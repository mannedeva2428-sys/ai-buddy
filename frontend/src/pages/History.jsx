import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MobileNav from '../components/MobileNav'
import TopNavigation from '../components/TopNavigation'
import { useTheme } from '../context/ThemeContext'
import { chatAPI } from '../services/api'

export default function History() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [messages, setMessages] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const res = await chatAPI.listConversations()
      setConversations(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openConversation = async (id) => {
    if (openId === id) {
      setOpenId(null)
      return
    }
    setOpenId(id)
    try {
      const res = await chatAPI.getHistory(id)
      setMessages(res.data)
    } catch (err) {
      setMessages([])
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return
    try {
      await chatAPI.deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.conversation_id !== id))
      if (openId === id) setOpenId(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-white'}`}>
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto chat-scroll pb-24 md:pb-6">
        <TopNavigation />

        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
          {loading ? (
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20">
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No conversations yet.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className={`mt-4 text-sm font-medium ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-brand-400 hover:text-brand-300'}`}
              >
                Start chatting →
              </button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {conversations.map((c) => (
                <li key={c.conversation_id}>
                  <div
                    onClick={() => openConversation(c.conversation_id)}
                    className={`cursor-pointer border rounded-xl px-4 py-3.5 transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm hover:border-indigo-400'
                        : 'bg-slate-900/60 border-white/5 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {c.title}
                        </p>
                        <p className={`text-xs truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {c.last_message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(c.conversation_id, e)}
                        className={`shrink-0 text-xs transition-colors cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-rose-600' : 'text-slate-600 hover:text-rose-400'
                        }`}
                      >
                        Delete
                      </button>
                    </div>

                    {openId === c.conversation_id && (
                      <div className={`mt-3 pt-3 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`text-xs rounded-lg px-3 py-2 ${
                              m.role === 'user'
                                ? isLight
                                  ? 'bg-indigo-100 text-indigo-900 ml-auto max-w-[85%]'
                                  : 'bg-indigo-500/20 text-indigo-200 ml-auto max-w-[85%]'
                                : isLight
                                  ? 'bg-slate-100 text-slate-800 max-w-[85%]'
                                  : 'bg-white/5 text-slate-300 max-w-[85%]'
                            }`}
                          >
                            {m.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

