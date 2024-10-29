import fs from 'fs'
import path from 'path'
import { DATA_FILE, VIDEO_DIR } from './config.js'

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000

export const deleteOldVideos = () => {
  let data
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch (err) {
    console.error('Ошибка при чтении файла данных:', err)
    return
  }

  const now = Date.now()

  Object.entries(data).forEach(([videoId, videoData]) => {
    const { id, dateDownloaded } = videoData
    const filePath = path.join(VIDEO_DIR, `${id}.mp4`)

    if (now - dateDownloaded > ONE_WEEK_IN_MS) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Ошибка при удалении файла ${filePath}:`, err)
        } else {
          console.log(`Файл ${filePath} был удален.`)
          delete data[videoId]
          fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
        }
      })
    }
  })
}
