import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import http from 'http'
import minecraftRoutes from './routes/minecraftRoutes.js'
import { setupMinecraftWebSocket } from './services/minecraftWebSocket.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://143.198.194.160:5173',
      'http://www.143.198.194.160:5173',
      'http://143.198.194.160:3000',
      process.env.CORS_ORIGIN || '*'
    ].filter(Boolean)
  })
)

// ROUTES - Only Minecraft routes
app.use('/api/minecraft', minecraftRoutes)

app.get('/', (_, res) => {
  res.json({
    message: 'DPanel Minecraft Dashboard API',
    status: 'running',
    version: '1.0.0'
  })
})

const PORT = process.env.PORT || 3000

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.IO for Minecraft logs
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://143.198.194.160:5173',
      'http://143.198.194.160:3000',
      process.env.CORS_ORIGIN || '*'
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
})

// Setup Minecraft WebSocket
io.on('connection', socket => {
  setupMinecraftWebSocket(socket, io)
})

server.listen(PORT, () => {
  console.log(`🚀 DPanel server is running on port ${PORT}`)
  console.log(
    `📊 Minecraft dashboard API: http://localhost:${PORT}/api/minecraft`
  )
})
