import type { Room, CreateRoomRequest, RoomMember } from '@shared/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const useRoomAPI = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  }

  const getRooms = async () => {
    const response = await fetch(`${API_BASE_URL}/api/rooms`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error("Failed to fetch rooms")
    }

    return response.json() as Promise<Room[]>
  }

  const getRoom = async (roomId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error("Failed to fetch room")
    }

    return response.json() as Promise<Room>
  }

  const createRoom = async (roomData: CreateRoomRequest) => {
    const response = await fetch(`${API_BASE_URL}/api/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create room")
    }

    return response.json() as Promise<Room>
  }

  const joinRoom = async (roomId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to join room")
    }

    return response.json()
  }

  const leaveRoom = async (roomId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/leave`, {
      method: "DELETE",
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to leave room")
    }

    return response.json()
  }

  const getRoomMembers = async (roomId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/members`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error("Failed to fetch room members")
    }

    return response.json() as Promise<RoomMember[]>
  }

  return {
    getRooms,
    getRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomMembers
  }
}