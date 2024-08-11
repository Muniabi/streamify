import ytdl from 'ytdl-core'

async function downloadVideo(videoUrl) {
  try {
    // Загружаем поток видео данных с YouTube
    return ytdl(videoUrl, { filter: 'audioandvideo', quality: 'highest' })
  } catch (error) {
    console.error(`Error in downloadVideo: ${error.message}`)
    throw error
  }
}

export { downloadVideo }
