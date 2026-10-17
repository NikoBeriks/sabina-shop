'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Message {
  id: number
  orderId: number | null
  sender: string
  text: string
  createdAt: string
  isRead: boolean
}

export default function AdminChatPage() {
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
      setMessages(data)

      // Mark customer messages as read
      await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin' }),
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(scrollToBottom, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin', text: text.trim() }),
      })
      setText('')
      fetchMessages()
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = messages.filter((m) => m.sender === 'customer' && !m.isRead).length

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-pink-600" />
          <h1 className="font-bold text-gray-800">Чат поддержки</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount} новых
            </span>
          )}
        </div>
        <button
          onClick={fetchMessages}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Обновить"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            Сообщений пока нет
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-sm">
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  msg.sender === 'admin'
                    ? 'bg-pink-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                {msg.sender === 'customer' ? '👤 Клиент' : '🛍️ Вы'} · {formatDate(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-gray-50 px-5 py-3">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ответить клиенту..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-200 text-white p-3 rounded-full transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
