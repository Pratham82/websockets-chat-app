import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import socket from "@/lib/socket"
import { useAuth } from "../../contexts/AuthContext"
import { useRoomAPI } from "../../hooks/useRoomAPI"
import { useMessageAPI } from "../../hooks/useMessageAPI"
import type { Room, Message } from "@shared/types"

export default function RoomChat() {
  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { id } = router.query
  const roomId = parseInt(id as string)

  const { user, isLoading: authLoading } = useAuth()
  const roomAPI = useRoomAPI()
  const messageAPI = useMessageAPI()

  useEffect(() => {
    if (authLoading || !user) return
    if (!roomId) return

    loadRoomAndMessages()
  }, [roomId, user, authLoading])

  useEffect(() => {
    if (!roomId || !user) return

    // Join the room
    socket.emit("join-room", roomId.toString())

    // Listen for new messages
    socket.on("room-message", handleNewMessage)

    return () => {
      socket.emit("leave-room", roomId.toString())
      socket.off("room-message", handleNewMessage)
    }
  }, [roomId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadRoomAndMessages = async () => {
    try {
      setLoading(true)
      setError("")

      // Load room details and initial messages in parallel
      const [roomData, messagesData] = await Promise.all([
        roomAPI.getRoom(roomId),
        messageAPI.getMessages(roomId, { limit: 50 }),
      ])

      setRoom(roomData)
      setMessages(messagesData.messages)
      setHasMore(messagesData.hasMore)
    } catch (err: any) {
      setError(err.message || "Failed to load room")
      if (
        err.message.includes("not found") ||
        err.message.includes("Access denied")
      ) {
        router.push("/")
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return

    try {
      setLoadingMore(true)
      const oldest = messages[0]?.created_at
      const messagesData = await messageAPI.getMessages(roomId, {
        before: oldest,
        limit: 50,
      })

      setMessages(prev => [...messagesData.messages, ...prev])
      setHasMore(messagesData.hasMore)
    } catch (err) {
      console.error("Failed to load more messages:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const sendMessage = async () => {
    if (!text.trim() || !user || sending) return

    try {
      setSending(true)

      // Send message to API
      const newMessage = await messageAPI.sendMessage(roomId, {
        content: text.trim(),
      })

      // Add to local state
      setMessages(prev => [...prev, newMessage])

      // Emit to socket for real-time updates
      socket.emit("room-message", {
        roomId: roomId.toString(),
        message: newMessage,
      })

      setText("")
    } catch (err: any) {
      setError(err.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return

    if (container.scrollTop === 0 && hasMore && !loadingMore) {
      loadMoreMessages()
    }
  }

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error && !room) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Back to rooms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-gray-400 hover:text-gray-600 mr-3">
              ← Back
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {room?.name}
              </h1>
              {room?.description && (
                <p className="text-sm text-gray-600">{room.description}</p>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {room?.member_count} members
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loadingMore && (
          <div className="text-center py-2">
            <div className="text-sm text-gray-500">
              Loading more messages...
            </div>
          </div>
        )}

        {messages.map(message => {
          const isCurrentUser = message.username === user.username
          return (
            <div
              key={message.id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  isCurrentUser
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {!isCurrentUser && (
                  <div className="text-xs font-medium text-gray-400 mb-1">
                    {message.username}
                  </div>
                )}
                <div className="text-sm mb-1">{message.content}</div>
                <div
                  className={`text-xs text-right ${
                    isCurrentUser ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-t border-red-400 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Input Container */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type a message..."
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}
