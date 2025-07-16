import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import { json } from "stream/consumers"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
  },
})

app.use(cors())
app.use(express.json())
app.get("/", (_, res) => res.send("API is running"))

io.on("connection", socket => {
  console.log(`User connected: \${socket.id}`)

  socket.on("message", (msg: string) => {
    console.log("Message received:", msg)
    socket.broadcast.emit("message", msg)
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: \${socket.id}`)
  })
})

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
