import Image from "next/image"
import { Geist, Geist_Mono } from "next/font/google"
import { useEffect, useState } from "react"
import socket from "../../lib/socket"
import { ChatMessage } from "@shared/types"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function Home() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    socket.on("message", msg => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      socket.off("message")
    }
  }, [])

  const handleSend = () => {
    if (!message.trim()) return
    socket.emit("message", message)
    setMessages(prev => [...prev, message])
    setMessage("")
  }

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20`}
    >
      <h1 className="text-4xl font-bold text-pink-600">Tailwind is working 🎉</h1>
      <main className="max-w-xl mx-auto p-6">
        <div className="space-y-2 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className="bg-gray-100 p-2 rounded">
              {msg}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="Type your message"
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
            Send
          </button>
        </div>
      </main>
    </div>
  )
}
