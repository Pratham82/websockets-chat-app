import { useEffect, useState } from "react"
import socket from "@/lib/socket"
import { v4 as uuid } from "uuid"
import type { ChatMessage } from "@shared/types"

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [sender, setSender] = useState<string | null>(null)

  useEffect(() => {
    const storedName = localStorage.getItem("sender")
    const name = storedName || `User-${Math.floor(Math.random() * 1000)}`
    setSender(name)
    localStorage.setItem("sender", name)
  }, [])

  useEffect(() => {
    socket.on("message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      socket.off("message")
    }
  }, [])

  const sendMessage = () => {
    if (!text.trim() || !sender) return

    const msg: ChatMessage = {
      id: uuid(),
      text,
      sender,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, msg])
    socket.emit("message", msg)
    setText("")
  }

  console.log({ messages })

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">
          Chat as <span className="text-blue-600">{sender}</span>
        </h1>
      </div>

      {/* Messages Container */}
      <div className="flex-1 border-red-500 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const isCurrentUser = msg.sender === sender
          return (
            <div
              key={msg.id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {!isCurrentUser && (
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {msg.sender}
                  </div>
                )}
                <div className="text-sm">{msg.text}</div>
                <div
                  className={`text-xs mt-1 ${
                    isCurrentUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Container */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
