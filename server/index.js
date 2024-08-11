import express from 'express'
import cors from 'cors'
import ytdl from 'ytdl-core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const VIDEO_DIR = path.join(__dirname, 'videos')

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR)
}

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})
const PORT = 3000

app.use(cors())
app.use('/videos', express.static(VIDEO_DIR))

let activeUsers = 0

io.on('connection', (socket) => {
  activeUsers++
  io.emit('userCount', activeUsers)

  socket.on('disconnect', () => {
    activeUsers--
    io.emit('userCount', activeUsers)
  })
})

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url
  const videoId = Date.now()
  const videoPath = path.join(VIDEO_DIR, `${videoId}.mp4`)

  if (!videoUrl) {
    return res.status(400).send('Video URL is required')
  }

  // Log request to download video
  console.log(`Received request to download video from URL: ${videoUrl}`)

  try {
    const videoStream = ytdl(videoUrl, { filter: 'audioandvideo', quality: 'highest' })
    const fileStream = fs.createWriteStream(videoPath)

    let downloadedBytes = 0
    let totalBytes = 0

    videoStream.on('response', (response) => {
      totalBytes = parseInt(response.headers['content-length'], 10)
      io.emit('download-progress', {
        progress: 0,
        downloadedBytes,
        totalBytes,
        speed: 0
      })
      // Log total bytes
      // console.log(`Total bytes: ${totalBytes}`)
    })

    videoStream.on('data', (chunk) => {
      downloadedBytes += chunk.length
      const progress = (downloadedBytes / totalBytes) * 100
      io.emit('download-progress', {
        progress,
        downloadedBytes,
        totalBytes,
        speed: downloadedBytes / 1024 / ((Date.now() - startTime) / 1000) // KB/s
      })
      // Removed progress log
      // console.log(`Downloaded ${downloadedBytes} bytes, progress ${progress}%`)
    })

    const startTime = Date.now()
    fileStream.on('finish', () => {
      // Log completion of video download
      console.log(`Video from URL ${videoUrl} has been downloaded to ${videoPath}`)
      res.status(200).send({ videoId })
    })

    fileStream.on('error', (error) => {
      console.error(`FileStream error: ${error.message}`)
      res.status(500).send('Failed to write video file')
    })

    videoStream.pipe(fileStream)

    videoStream.on('error', (error) => {
      console.error(`Error while downloading video: ${error.message}`)
      res.status(500).send('Failed to download video')
    })
  } catch (error) {
    console.error(`Error while processing request: ${error.message}`)
    res.status(500).send('Failed to process video')
  }
})

app.get('/stream/:videoId', (req, res) => {
  const { videoId } = req.params
  const videoPath = path.join(VIDEO_DIR, `${videoId}.mp4`)

  if (!fs.existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`)
    return res.status(404).send('Video not found')
  }

  const range = req.headers.range

  if (range) {
    const videoSize = fs.statSync(videoPath).size
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = Math.min(start + 1024 * 1024 - 1, videoSize - 1) // 1MB chunks

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4'
    })

    const videoStream = fs.createReadStream(videoPath, { start, end })
    videoStream.pipe(res)

    videoStream.on('error', (error) => {
      console.error(`Error while streaming video: ${error.message}`)
      res.status(500).send('Failed to stream video')
    })
  } else {
    res.setHeader('Content-Type', 'video/mp4')
    const videoStream = fs.createReadStream(videoPath)
    videoStream.pipe(res)

    videoStream.on('error', (error) => {
      console.error(`Error while streaming video: ${error.message}`)
      res.status(500).send('Failed to stream video')
    })
  }
})

server.listen(PORT, () => {
  // Log server start
  console.log(`Server is running on http://localhost:${PORT}`)
})
