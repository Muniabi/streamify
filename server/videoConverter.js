// videoConverter.js
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { VIDEO_DIR } from './config.js'

export const convertVideo = (url, format, res) => {
  const videoId = Date.now()
  const videoPath = path.join(VIDEO_DIR, `${videoId}.mp4`)
  const outputPath = path.join(VIDEO_DIR, `${videoId}.${format}`)

  const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" --output "${videoPath}" ${url}`
  const downloadProcess = exec(command)

  downloadProcess.on('exit', () => {
    ffmpeg(videoPath)
      .output(outputPath)
      .on('end', () => {
        fs.unlinkSync(videoPath)
        res.status(200).json({ videoId })
      })
      .on('error', (err) => {
        console.error(`Ошибка при конвертации видео: ${err.message}`)
        res.status(500).send('Ошибка при конвертации видео')
      })
      .run()
  })
}
