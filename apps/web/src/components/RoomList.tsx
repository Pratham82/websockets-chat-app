import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useRoomAPI } from "../hooks/useRoomAPI"
import { CreateRoomModal } from "./CreateRoomModal"
import type { Room } from "@shared/types"

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()
  const roomAPI = useRoomAPI()

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const roomsData = await roomAPI.getRooms()
      setRooms(roomsData)
      setError("")
    } catch (err: unknown) {
      setError("Failed to load rooms")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoomClick = (room: Room) => {
    if (room.is_member) {
      router.push(`/rooms/${room.id}`)
    } else {
      handleJoinRoom(room.id)
    }
  }

  const handleJoinRoom = async (roomId: number) => {
    try {
      await roomAPI.joinRoom(roomId)
      setRooms(prev => 
        prev.map(room => 
          room.id === roomId 
            ? { ...room, is_member: true, member_count: (room.member_count || 0) + 1 }
            : room
        )
      )
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to join room"
      setError(errorMessage)
    }
  }

  const handleCreateRoom = async (roomData: { name: string; description?: string; is_private?: boolean }) => {
    try {
      const newRoom = await roomAPI.createRoom(roomData)
      setRooms(prev => [newRoom, ...prev])
      setShowCreateModal(false)
      router.push(`/rooms/${newRoom.id}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create room"
      throw new Error(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading rooms...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Chat Rooms</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Room
          </button>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {rooms.map(room => (
            <div
              key={room.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  {room.description && (
                    <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{room.member_count || 0} members</span>
                    {room.is_private && (
                      <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                    {room.is_member && (
                      <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded">
                        Joined
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-xs text-gray-400">
                    {new Date(room.created_at).toLocaleDateString()}
                  </div>
                  {room.is_member ? (
                    <button
                      onClick={() => router.push(`/rooms/${room.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Enter
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {rooms.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No rooms available.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Create the first room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}
    </div>
  )
}