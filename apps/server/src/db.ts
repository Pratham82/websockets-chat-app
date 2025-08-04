import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const query = (text: string, params?: any[]) => pool.query(text, params)

export const initDB = async () => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Rooms table
    await query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_by INTEGER REFERENCES users(id),
        is_private BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `)

    // Room members table
    await query(`
      CREATE TABLE IF NOT EXISTS room_members (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      )
    `)

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
    `)

    // Create a default "General" room
    const existingRoom = await query('SELECT id FROM rooms WHERE name = $1', ['General'])
    if (existingRoom.rows.length === 0) {
      await query(`
        INSERT INTO rooms (name, description, is_private) 
        VALUES ('General', 'Welcome to the general chat room!', false)
      `)
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

export default pool
