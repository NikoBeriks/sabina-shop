'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, MessageCircle } from 'lucide-react'
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
      setMessages(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000) // Poll every 5s
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Поддержка Sabina Shop</h1>
              <p className="text-xs text-green-500">● Онлайн</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 overflow-y-auto space-y-3">
        {/* Welcome */}
        <div className="text-center py-4">
          <div className="inline-block bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600 shadow-sm">
            👋 Привет! Чем можем помочь? Напишите ваш вопрос.
          </div>
        </div>

        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            Здесь появятся ваши сообщения
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === 'customer'
                  ? 'bg-pink-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'customer' ? 'text-pink-200' : 'text-gray-400'}`}>
                {formatDate(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="bg-white border-t sticky bottom-0">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
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
