import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"

import { ChatMessage } from "@shared/types"
import { initDB } from "./db"
import authRoutes from "./routes/auth"
import { swaggerUi, specs } from "./swagger"

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
  },
})

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
app.get("/", (_, res) => res.send("API is running"))

io.on("connection", socket => {
  console.log(`User connected: \${socket.id}`)

  socket.on("message", (msg: ChatMessage) => {
    console.log("Message received:", msg)
    socket.broadcast.emit("message", msg)
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: \${socket.id}`)
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
