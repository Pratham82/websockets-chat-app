export interface ChatMessage {
  id: string
  text: string
  sender: string
  timestamp: number
  message: string
}

export interface Room {
  id: number
  name: string
  description?: string
  created_by: number
  is_private: boolean
  created_at: string
  updated_at: string
  member_count?: number
  is_member?: boolean
}

export interface Message {
  id: number
  room_id: number
  user_id: number
  content: string
  message_type: 'text' | 'image' | 'file'
  created_at: string
  updated_at: string
  deleted_at?: string
  username?: string
}

export interface RoomMember {
  id: number
  room_id: number
  user_id: number
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  username?: string
}

export interface CreateRoomRequest {
  name: string
  description?: string
  is_private?: boolean
}

export interface SendMessageRequest {
  content: string
  message_type?: 'text' | 'image' | 'file'
}

export interface GetMessagesQuery {
  before?: string
  limit?: number
}
