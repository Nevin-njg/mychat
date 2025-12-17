const app = require('./app')           // Express app (from express-generator)
const http = require('http')
const { Server } = require('socket.io')

// Create HTTP server
const server = http.createServer(app)

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["https://mychat-njg.netlify.app", "http://localhost:5173"], 
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)

  socket.on('join', (username) => {
    console.log('➡️ JOIN:', username)
    socket.username = username
  })

  socket.on('chat', (message) => {
    console.log('➡️ CHAT RECEIVED:', message)
    io.emit('chat', {
      text: message,
      sender: socket.id,
      username: socket.username
    })
  })

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
  })
})


// Start server
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
