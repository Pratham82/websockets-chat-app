import express from 'express'
import { query } from '../db'
import { authenticateToken, type AuthRequest } from '../middleware/auth'
import type { SendMessageRequest } from '@shared/types'

const router = express.Router()

// Get messages for a room with pagination
router.get('/:roomId', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const roomId = parseInt(req.params.roomId)
    const userId = req.user?.userId
    const { before, limit = 50 } = req.query as { before?: string; limit?: number }

    // Check if user has access to this room
    const accessCheck = await query(`
      SELECT rm.* FROM room_members rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.room_id = $1 AND rm.user_id = $2 AND (r.is_private = false OR rm.user_id IS NOT NULL)
    `, [roomId, userId])

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this room' })
    }

    // Build query with pagination
    let messagesQuery = `
      SELECT m.*, u.username 
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = $1 AND m.deleted_at IS NULL
    `
    const queryParams: any[] = [roomId]

    if (before) {
      messagesQuery += ` AND m.created_at < $${queryParams.length + 1}`
      queryParams.push(before)
    }

    messagesQuery += ` ORDER BY m.created_at DESC LIMIT $${queryParams.length + 1}`
    queryParams.push(Number(limit))

    const messagesResult = await query(messagesQuery, queryParams)

    // Reverse to show oldest first
    const messages = messagesResult.rows.reverse()

    res.json({
      messages,
      hasMore: messages.length === Number(limit),
      oldest: messages.length > 0 ? messages[0].created_at : null
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Send message to room
router.post('/:roomId', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const roomId = parseInt(req.params.roomId)
    const userId = req.user?.userId
    const { content, message_type = 'text' }: SendMessageRequest = req.body

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' })
    }

    // Check if user has access to this room
    const accessCheck = await query(`
      SELECT rm.* FROM room_members rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.room_id = $1 AND rm.user_id = $2
    `, [roomId, userId])

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this room' })
    }

    // Insert message
    const messageResult = await query(`
      INSERT INTO messages (room_id, user_id, content, message_type) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [roomId, userId, content.trim(), message_type])

    // Get message with username
    const messageWithUser = await query(`
      SELECT m.*, u.username 
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [messageResult.rows[0].id])

    res.status(201).json(messageWithUser.rows[0])
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete message (soft delete)
router.delete('/:roomId/:messageId', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const roomId = parseInt(req.params.roomId)
    const messageId = parseInt(req.params.messageId)
    const userId = req.user?.userId

    // Check if user owns the message or is room admin
    const messageCheck = await query(`
      SELECT m.*, rm.role 
      FROM messages m
      LEFT JOIN room_members rm ON m.room_id = rm.room_id AND rm.user_id = $1
      WHERE m.id = $2 AND m.room_id = $3 AND m.deleted_at IS NULL
    `, [userId, messageId, roomId])

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' })
    }

    const message = messageCheck.rows[0]
    const canDelete = message.user_id === userId || message.role === 'admin' || message.role === 'moderator'

    if (!canDelete) {
      return res.status(403).json({ error: 'Not authorized to delete this message' })
    }

    // Soft delete message
    await query(`
      UPDATE messages 
      SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [messageId])

    res.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router