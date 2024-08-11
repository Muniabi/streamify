<template>
  <div id="app">
    <header>
      <h1>Video Downloader</h1>
      <UserCounter />
      <!-- Добавляем компонент UserCounter -->
    </header>
    <main>
      <VideoForm @video-url-submitted="handleVideoUrl" />
      <Loader v-if="loading" />
      <VideoPlayer v-if="!loading && videoUrl" :videoUrl="videoUrl" />
    </main>
  </div>
</template>

<script>
import VideoForm from './components/VideoForm.vue'
import VideoPlayer from './components/VideoPlayer.vue'
import Loader from './components/LoadingSpinner.vue'
import UserCounter from './components/UserCounter.vue' // Импортируем компонент UserCounter

export default {
  components: {
    VideoForm,
    VideoPlayer,
    Loader,
    UserCounter // Регистрируем компонент UserCounter
  },
  data() {
    return {
      videoUrl: '',
      loading: false
    }
  },
  methods: {
    async handleVideoUrl(url) {
      this.loading = true
      try {
        // Отправляем запрос на сервер для загрузки видео
        const response = await fetch(
          `http://localhost:3000/download?url=${encodeURIComponent(url)}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        if (data.videoId) {
          this.videoUrl = `http://localhost:3000/videos/${data.videoId}.mp4`
        } else {
          throw new Error('Invalid response from server')
        }
      } catch (error) {
        console.error('Error in handleVideoUrl:', error)
        alert('Failed to load video')
      } finally {
        this.loading = false
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

header {
  padding: 1rem;
  text-align: center;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
