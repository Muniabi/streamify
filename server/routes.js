// routes.js
import express from 'express'
import { downloadVideo } from './videoDownloader.js'
import { convertVideo } from './videoConverter.js'
import { VIDEO_DIR } from './config.js'
import fs from 'fs'
import path from 'path'

export const router = express.Router()

router.get('/download', (req, res) => {
  const videoUrl = req.query.url
  if (!videoUrl) return res.status(400).send('URL-адрес видео обязателен')
  downloadVideo(videoUrl, req.app.get('io'), res)
})

router.post('/convert', (req, res) => {
  const { url, format } = req.query
  if (!url || !format) return res.status(400).send('URL и формат обязательны')
  convertVideo(url, format, res)
})

router.get('/download/:videoId', (req, res) => {
  const { videoId } = req.params
  const videoPath = path.join(VIDEO_DIR, `${videoId}.mp4`)
  fs.existsSync(videoPath) ? res.download(videoPath) : res.status(404).send('Видео не найдено')
})

router.get('/converted/:videoId/:format', (req, res) => {
  const { videoId, format } = req.params
  const videoPath = path.join(VIDEO_DIR, `${videoId}.${format}`)
  fs.existsSync(videoPath)
    ? res.download(videoPath)
    : res.status(404).send('Конвертированное видео не найдено')
})
