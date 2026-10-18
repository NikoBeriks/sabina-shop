'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, MessageSquare, CheckCheck } from 'lucide-react'
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
    <div className="min-h-screen bg-[#fcfcfb] flex flex-col font-sans text-neutral-900">
      {/* Header */}
      <header className="bg-white border-b border-neutral-300 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-none border border-neutral-300 bg-white hover:border-neutral-950 flex items-center justify-center text-neutral-800 transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-neutral-950 text-white flex items-center justify-center font-mono text-xs font-bold">
                МХ
              </div>
              <div>
                <h1 className="font-bold text-xs sm:text-sm text-neutral-950 uppercase tracking-tight leading-tight">
                  Служба поддержки &middot; Магазин Хавпачевых
                </h1>
                <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider">Оператор на связи</p>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/79287144816"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono uppercase tracking-wider text-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 py-1.5 rounded-none transition-colors"
          >
            WhatsApp &rarr;
          </a>
        </div>
      </header>

      {/* Messages Feed */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 overflow-y-auto space-y-3">
        {/* Welcome Card */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-300 rounded-none px-4 py-2.5 text-xs text-neutral-700 font-mono uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-900" />
            <span>Здравствуйте! Напишите нам &mdash; ответим по наличию товаров и доставке.</span>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="text-center text-neutral-400 font-mono text-xs uppercase py-12">
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
                className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-none text-xs sm:text-sm leading-relaxed ${
                  isMe
                    ? 'bg-neutral-950 text-white border border-neutral-950'
                    : 'bg-white text-neutral-900 border border-neutral-300'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 font-mono ${
                    isMe ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  <span>{formatDate(msg.createdAt)}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Form */}
      <div className="bg-white border-t border-neutral-300 sticky bottom-0 p-3 sm:p-4">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите сообщение оператору..."
            className="flex-1 px-4 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-950 rounded-none text-xs sm:text-sm focus:outline-none transition-colors text-neutral-900 placeholder-neutral-400 font-sans"
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white px-4 py-2.5 rounded-none transition-colors border border-neutral-950 font-bold uppercase tracking-wider text-xs"
            aria-label="Отправить"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

