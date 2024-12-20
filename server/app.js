import express from 'express'
import http from 'http'
import cors from 'cors'
import { initializeSocket } from './socket.js'
import { router } from './routes.js'
import { STORAGE_DIR, VIDEO_DIR, PORT } from './config.js'
import fs from 'fs'
import { deleteOldVideos } from './deleteOldVideos.js'

if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR)
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR)

const app = express()
const server = http.createServer(app)
const io = initializeSocket(server)

app.use(cors())
app.use('/videos', express.static(VIDEO_DIR))
app.use(express.json())
app.use('/', router)

app.set('io', io)

deleteOldVideos()

setInterval(() => {
  console.log('Запуск удаления старых видео...')
  deleteOldVideos()
}, 3600000) // 3600000 мс = 1 час

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
