const app = require('./app')           // Express app (from express-generator)
const http = require('http')
const { Server } = require('socket.io')

// Create HTTP server
const server = http.createServer(app)

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend during development
    methods: ["GET", "POST"]
  }
})

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Listen for chat messages
  socket.on('chat', (message) => {
    io.emit('chat', {
      text: message,
      sender: socket.id
    })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Start server
const PORT = 3000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
