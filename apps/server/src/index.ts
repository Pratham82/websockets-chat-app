import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"

import { ChatMessage } from "@shared/types"
import { initDB } from "./db"
import authRoutes from "./routes/auth"
import roomRoutes from "./routes/rooms"
import messageRoutes from "./routes/messages"
import { swaggerUi, specs } from "./swagger"

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  },
})

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}))
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
app.get("/", (_, res) => res.send("API is running"))

io.on("connection", socket => {
  console.log(`User connected: ${socket.id}`)

  // Handle joining a room
  socket.on("join-room", (roomId: string) => {
    socket.join(`room-${roomId}`)
    console.log(`User ${socket.id} joined room ${roomId}`)
    
    // Notify others in the room
    socket.to(`room-${roomId}`).emit("user-joined", {
      socketId: socket.id,
      roomId
    })
  })

  // Handle leaving a room
  socket.on("leave-room", (roomId: string) => {
    socket.leave(`room-${roomId}`)
    console.log(`User ${socket.id} left room ${roomId}`)
    
    // Notify others in the room
    socket.to(`room-${roomId}`).emit("user-left", {
      socketId: socket.id,
      roomId
    })
  })

  // Handle room-based messages
  socket.on("room-message", (data: { roomId: string, message: any }) => {
    console.log("Room message received:", data)
    
    // Broadcast to all users in the room except sender
    socket.to(`room-${data.roomId}`).emit("room-message", data.message)
  })

  // Handle typing indicators
  socket.on("typing", (data: { roomId: string, username: string, isTyping: boolean }) => {
    socket.to(`room-${data.roomId}`).emit("typing", data)
  })

  // Legacy support for old ChatMessage format (can be removed later)
  socket.on("message", (msg: ChatMessage) => {
    console.log("Legacy message received:", msg)
    socket.broadcast.emit("message", msg)
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 4000

const startServer = async () => {
  try {
    await initDB()
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
