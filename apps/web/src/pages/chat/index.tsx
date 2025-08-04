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
    if (!text.trim()) return

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

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Chat as <span className="text-blue-600">{sender}</span>
      </h1>
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto border rounded p-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className="text-sm">
            <span className="font-semibold">{msg.sender}:</span> {msg.text}
            <span className="text-gray-400 text-xs ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Type a message"
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </main>
  )
}
