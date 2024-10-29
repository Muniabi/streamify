import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { DATA_FILE, VIDEO_DIR } from './config.js'

// Функция для загрузки видео
export const downloadVideo = (url, io, res) => {
  const videoId = Date.now()
  const videoPath = path.join(VIDEO_DIR, `${videoId}.mp4`)

  console.log(`Получен запрос на загрузку видео с URL: ${url}`)

  let data
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch (err) {
    console.error('Ошибка при чтении файла данных:', err)
    return res.status(500).send('Internal server error')
  }

  const existingEntry = Object.values(data).find((entry) => entry.url === url)
  if (existingEntry) {
    const existingVideoPath = path.join(VIDEO_DIR, `${existingEntry.id}.mp4`)
    const isFileIntact = fs.existsSync(existingVideoPath) && fs.statSync(existingVideoPath).size > 0

    if (isFileIntact) {
      console.log(
        `Видео с URL ${url} уже существует. Возвращаем существующий videoId: ${existingEntry.id}`
      )
      return res.status(200).send({ videoId: existingEntry.id })
    } else {
      console.log(`Видео с URL ${url} существует, но файл поврежден. Перезагружаем видео.`)
      io.emit('reload-started')
      delete data[existingEntry.id]
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    }
  }

  // Получение общего размера видео перед загрузкой
  exec(`yt-dlp --print "filesize" ${url}`, (err, stdout) => {
    if (err) {
      console.error('Ошибка при получении размера файла:', err.message)
      return res.status(500).send('Failed to get file size')
    }

    const totalSize = parseFloat(stdout.trim())
    console.log(`Размер файла: ${isNaN(totalSize) ? 'Не удалось определить' : `${totalSize} байт`}`)

    // Команда для скачивания видео
    const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" --output "${videoPath}" ${url}`
    const downloadProcess = exec(command)

    // Отслеживание прогресса скачивания
    downloadProcess.stdout.on('data', (data) => {
      const match = data.match(
        /\[download\]\s+(\d+\.\d+)%\s+of\s+~?(\d+\.\d+)(\w+)\s+at\s+(\d+\.\d+)(\w+)\/s/i
      )
      if (match) {
        const progress = parseFloat(match[1])
        const speed = parseFloat(match[4]) * (match[5] === 'MiB' ? 1024 : 1)
        io.emit('download-progress', {
          progress,
          downloadedBytes: (progress * totalSize) / 100,
          totalBytes: totalSize,
          speed
        })
      }
    })

    // Действие по завершении загрузки
    downloadProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Видео с URL ${url} успешно загружено и сохранено как ${videoPath}`)

        // Обновление файла данных с информацией о новом видео
        data[videoId] = {
          id: videoId,
          url: url,
          dateDownloaded: Date.now()
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

        io.emit('download-complete')
        res.status(200).send({ videoId })
      } else {
        console.error(`Ошибка при загрузке видео: код ${code}`)
        res.status(500).send('Failed to download video')
      }
    })
  })
}
