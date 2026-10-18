'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, MessageCircle, Sparkles, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Message {
  id: number
  sender: string
  text: string
  createdAt: string
  isRead: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      if (Array.isArray(data)) {
        setMessages(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(scrollToBottom, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'customer', text: text.trim() }),
      })
      if (res.ok) {
        setText('')
        fetchMessages()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xs border-b border-neutral-200/80 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-emerald-50 flex items-center justify-center text-neutral-600 hover:text-emerald-700 transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base text-neutral-900 leading-tight">
                  Поддержка Sabina Shop
                </h1>
                <p className="text-[11px] text-emerald-600 font-semibold">Оператор на связи</p>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/79287144816"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </header>

      {/* Messages Feed */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 overflow-y-auto space-y-3">
        {/* Welcome Card */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200/70 rounded-2xl px-4 py-2.5 text-xs text-neutral-600 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Здравствуйте! Напишите нам — ответим по наличию товаров и доставке.</span>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="text-center text-neutral-400 text-xs py-12">
            Напишите сообщение ниже, чтобы начать диалог.
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === 'customer'
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-3xl shadow-xs text-sm leading-relaxed ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-br-md shadow-emerald'
                    : 'bg-white text-neutral-800 rounded-bl-md border border-neutral-200/70'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 font-mono ${
                    isMe ? 'text-emerald-100/80' : 'text-neutral-400'
                  }`}
                >
                  <span>{formatDate(msg.createdAt)}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Form */}
      <div className="bg-white/95 backdrop-blur-md border-t border-neutral-200/80 sticky bottom-0 p-3 sm:p-4">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 px-4 py-3 bg-neutral-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all text-neutral-800 placeholder-neutral-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white p-3.5 rounded-2xl transition-all active:scale-95 shadow-emerald shadow-xs"
            aria-label="Отправить"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
