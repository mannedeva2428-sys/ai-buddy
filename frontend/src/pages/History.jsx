import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MobileNav from '../components/MobileNav'
import TopNavigation from '../components/TopNavigation'
import { chatAPI } from '../services/api'

export default function History() {
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
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto chat-scroll pb-24 md:pb-6">
        <TopNavigation />

        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-sm">No conversations yet.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 text-sm text-brand-400 hover:text-brand-300 font-medium"
              >
                Start chatting →
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {conversations.map((c) => (
                <li key={c.conversation_id}>
                  <div
                    onClick={() => openConversation(c.conversation_id)}
                    className="cursor-pointer bg-slate-900/60 border border-white/5 rounded-xl px-4 py-3 hover:border-brand-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{c.title}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{c.last_message}</p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(c.conversation_id, e)}
                        className="shrink-0 text-slate-600 hover:text-red-400 text-xs"
                      >
                        Delete
                      </button>
                    </div>

                    {openId === c.conversation_id && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`text-xs rounded-lg px-3 py-2 ${
                              m.role === 'user'
                                ? 'bg-brand-500/10 text-brand-200 ml-auto max-w-[85%]'
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
