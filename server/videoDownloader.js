// videoDownloader.js
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { DATA_FILE, VIDEO_DIR } from './config.js'

export const downloadVideo = (url, io, res) => {
  const videoId = Date.now()
  const videoPath = path.join(VIDEO_DIR, `${videoId}.mp4`)

  console.log(`Получен запрос на загрузку видео с URL: ${url}`)

  let data
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE))
  } catch (err) {
    console.error('Ошибка при чтении файла данных:', err)
    return res.status(500).send('Internal server error')
  }

  const existingEntry = Object.values(data).find((entry) => entry.url === url)
  if (existingEntry) {
    console.log(
      `Видео с URL ${url} уже существует. Возвращаем существующий videoId: ${existingEntry.id}`
    )
    return res.status(200).send({ videoId: existingEntry.id })
  }

  const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" --output "${videoPath}" ${url}`
  const downloadProcess = exec(command)

  downloadProcess.stdout.on('data', (data) => {
    const match = data.match(
      /\[download\]\s+(\d+\.\d+)%\s+of\s+~?(\d+\.\d+)(\w+)\s+at\s+(\d+\.\d+)(\w+)\/s/i
    )
    if (match) {
      const progress = parseFloat(match[1])
      const totalSize = parseFloat(match[2]) * (match[3] === 'MiB' ? 1024 * 1024 : 1024)
      const speed = parseFloat(match[4]) * (match[5] === 'MiB' ? 1024 : 1)
      const downloadedBytes = (progress / 100) * totalSize
      io.emit('download-progress', { progress, downloadedBytes, totalSize, speed })
    }
  })

  downloadProcess.on('exit', (code) => {
    if (code === 0) {
      data[videoId] = { id: videoId, url, path: videoPath }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data))
      console.log(`Видео с URL ${url} было успешно загружено и сохранено как ${videoPath}`)
      res.status(200).send({ videoId })
    } else {
      console.error(`Ошибка при загрузке видео с URL ${url}`)
      res.status(500).send('Failed to download video')
    }
  })
}
