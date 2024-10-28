// socket.js
import { Server } from 'socket.io'

let activeUsers = 0

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    activeUsers++
    io.emit('userCount', activeUsers)

    socket.on('disconnect', () => {
      activeUsers--
      io.emit('userCount', activeUsers)
    })
  })

  return io
}
