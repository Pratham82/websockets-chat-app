import express from "express"
import { query } from "../db"
import { authenticateToken, type AuthRequest } from "../middleware/auth"
import { CreateRoomRequest } from "../types"
// import type { CreateRoomRequest } from '@shared/types'

const router = express.Router()

// Get all rooms (public rooms + rooms user is a member of)
router.get("/", authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.userId

    const result = await query(
      `
      SELECT r.*, 
        COALESCE(rm_count.member_count, 0) as member_count,
        CASE WHEN user_rm.user_id IS NOT NULL THEN true ELSE false END as is_member
      FROM rooms r
      LEFT JOIN (
        SELECT room_id, COUNT(*) as member_count
        FROM room_members
        GROUP BY room_id
      ) rm_count ON r.id = rm_count.room_id
      LEFT JOIN room_members user_rm ON r.id = user_rm.room_id AND user_rm.user_id = $1
      WHERE r.is_private = false OR user_rm.user_id IS NOT NULL
      ORDER BY r.created_at DESC
    `,
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching rooms:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get specific room details
router.get("/:id", authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const roomId = parseInt(req.params.id)
    const userId = req.user?.userId

    // Check if user has access to this room
    const accessCheck = await query(
      `
      SELECT r.*, 
        COUNT(rm.user_id) as member_count,
        CASE WHEN user_rm.user_id IS NOT NULL THEN true ELSE false END as is_member
      FROM rooms r
      LEFT JOIN room_members rm ON r.id = rm.room_id
      LEFT JOIN room_members user_rm ON r.id = user_rm.room_id AND user_rm.user_id = $2
      WHERE r.id = $1 AND (r.is_private = false OR user_rm.user_id IS NOT NULL)
      GROUP BY r.id, user_rm.user_id
    `,
      [roomId, userId]
    )

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: "Room not found or access denied" })
    }

    res.json(accessCheck.rows[0])
  } catch (error) {
    console.error("Error fetching room:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create new room
router.post("/", authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { name, description, is_private = false }: CreateRoomRequest = req.body
    const userId = req.user?.userId

    if (!name?.trim()) {
      return res.status(400).json({ error: "Room name is required" })
    }

    // Check if room name already exists
    const existingRoom = await query("SELECT id FROM rooms WHERE LOWER(name) = LOWER($1)", [
      name.trim(),
    ])

    if (existingRoom.rows.length > 0) {
      return res.status(400).json({ error: "Room name already exists" })
    }

    // Create room
    const roomResult = await query(
      `
      INSERT INTO rooms (name, description, created_by, is_private) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `,
      [name.trim(), description?.trim() || null, userId, is_private]
    )

    const room = roomResult.rows[0]

    // Add creator as admin member
    await query(
      `
      INSERT INTO room_members (room_id, user_id, role) 
      VALUES ($1, $2, 'admin')
    `,
      [room.id, userId]
    )

    res.status(201).json({
      ...room,
      member_count: 1,
      is_member: true,
    })
  } catch (error) {
    console.error("Error creating room:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Join room
router.post("/:id/join", authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const roomId = parseInt(req.params.id)
    const userId = req.user?.userId

    // Check if room exists and is accessible
    const roomCheck = await query(
      `
      SELECT * FROM rooms WHERE id = $1 AND is_private = false
    `,
      [roomId]
    )

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: "Room not found or is private" })
    }

    // Check if already a member
    const memberCheck = await query(
      `
      SELECT id FROM room_members WHERE room_id = $1 AND user_id = $2
    `,
      [roomId, userId]
    )

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ error: "Already a member of this room" })
    }

    // Add user to room
    await query(
      `
      INSERT INTO room_members (room_id, user_id, role) 
      VALUES ($1, $2, 'member')
    `,
      [roomId, userId]
    )

    res.json({ message: "Successfully joined room" })
  } catch (error) {
    console.error("Error joining room:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Leave room
router.delete("/:id/leave", authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const roomId = parseInt(req.params.id)
    const userId = req.user?.userId

    // Check if user is a member
    const memberCheck = await query(
      `
      SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2
    `,
      [roomId, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(400).json({ error: "Not a member of this room" })
    }

    // Remove user from room
    await query(
      `
      DELETE FROM room_members WHERE room_id = $1 AND user_id = $2
    `,
      [roomId, userId]
    )

    res.json({ message: "Successfully left room" })
  } catch (error) {
    console.error("Error leaving room:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get room members
router.get("/:id/members", authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const roomId = parseInt(req.params.id)
    const userId = req.user?.userId

    // Check if user has access to this room
    const accessCheck = await query(
      `
      SELECT rm.* FROM room_members rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.room_id = $1 AND rm.user_id = $2 AND (r.is_private = false OR rm.user_id IS NOT NULL)
    `,
      [roomId, userId]
    )

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Get all members
    const membersResult = await query(
      `
      SELECT rm.*, u.username 
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = $1
      ORDER BY rm.joined_at ASC
    `,
      [roomId]
    )

    res.json(membersResult.rows)
  } catch (error) {
    console.error("Error fetching room members:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
