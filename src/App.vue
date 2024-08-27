<template>
  <div id="app">
    <header>
      <h1 class="main-header">Streamify Video Downloader</h1>
      <UserCounter class="userCounter" />
    </header>
    <main>
      <VideoForm @video-url-submitted="handleVideoUrl" class="videoForm" />
      <Loader v-if="loading" :isDownloading="isDownloading" />
      <!-- Основной видеоплеер -->
      <VideoPlayer v-if="!loading && currentVideoUrl" :videoUrl="currentVideoUrl" />
      <!-- История загруженных видео -->
      <div class="video-history" v-if="videoHistory.length > 0">
        <h2>История загруженных видео:</h2>
        <div v-for="(video, index) in videoHistory" :key="index" class="video-item">
          <VideoPlayer :videoUrl="video.url" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import VideoForm from './components/VideoForm.vue'
import VideoPlayer from './components/VideoPlayer.vue'
import Loader from './components/LoadingSpinner.vue'
import UserCounter from './components/UserCounter.vue'

export default {
  components: {
    VideoForm,
    VideoPlayer,
    Loader,
    UserCounter
  },
  data() {
    return {
      currentVideoUrl: '', // Текущий URL загруженного видео
      loading: false, // Состояние загрузки
      isDownloading: false, // Состояние подготовки к загрузке
      videoHistory: [] // Массив для хранения истории загруженных видео
    }
  },
  methods: {
    async handleVideoUrl(url) {
      this.loading = true
      this.isDownloading = false

      try {
        // Отправляем запрос на сервер для загрузки видео
        const response = await fetch(
          `http://147.45.68.254:3000/download?url=${encodeURIComponent(url)}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        if (data.videoId) {
          const videoUrl = `http://147.45.68.254:3000/videos/${data.videoId}.mp4`
          this.currentVideoUrl = videoUrl
          // Добавляем новое видео в историю
          this.videoHistory.unshift({ url: videoUrl })
        } else {
          throw new Error('Invalid response from server')
        }
      } catch (error) {
        console.error('Error in handleVideoUrl:', error)
        alert('Не удалось загрузить видео')
      } finally {
        this.loading = false
        this.isDownloading = true // Загрузка завершена, показываем видео
      }
    }
  }
}
</script>

<style scoped>
#app {
  color: white;
  background-color: #121212;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

* {
  /* outline: 1px solid red; */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.userCounter {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 12px;
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

header {
  padding-block: 1rem;
  text-align: center;
}

.main-header {
  font-size: 32px;
}

@media (max-width: 600px) {
  .main-header {
    font-size: 22px;
  }
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.videoForm {
  margin-block: 5rem;
}

/* Стили для истории видео */
.video-history {
  width: 80%;
  margin-top: 2rem;
  text-align: center;
}

.video-item {
  margin-bottom: 1.5rem;
}

.video-item video {
  max-width: 100%;
  border: 2px solid #333;
  border-radius: 8px;
}
</style>
