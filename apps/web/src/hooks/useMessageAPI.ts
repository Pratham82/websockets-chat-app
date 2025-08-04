import type { Message, SendMessageRequest, GetMessagesQuery } from '@shared/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface MessagesResponse {
  messages: Message[]
  hasMore: boolean
  oldest: string | null
}

export const useMessageAPI = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  }

  const getMessages = async (roomId: number, query?: GetMessagesQuery) => {
    const params = new URLSearchParams()
    if (query?.before) params.append("before", query.before)
    if (query?.limit) params.append("limit", query.limit.toString())

    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/messages/${roomId}${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error("Failed to fetch messages")
    }

    return response.json() as Promise<MessagesResponse>
  }

  const sendMessage = async (roomId: number, messageData: SendMessageRequest) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/${roomId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to send message")
    }

    return response.json() as Promise<Message>
  }

  const deleteMessage = async (roomId: number, messageId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/${roomId}/${messageId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete message")
    }

    return response.json()
  }

  return {
    getMessages,
    sendMessage,
    deleteMessage
  }
}