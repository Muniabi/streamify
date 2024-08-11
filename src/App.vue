<template>
  <div id="app">
    <header>
      <h1 class="main-header">Streamify Video Downloader</h1>
      <UserCounter class="userCounter" />
    </header>
    <main>
      <VideoForm @video-url-submitted="handleVideoUrl" class="videoForm" />
      <Loader v-if="loading" />
      <VideoPlayer v-if="!loading && videoUrl" :videoUrl="videoUrl" />
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
          `http://192.168.102.120:3000/download?url=${encodeURIComponent(url)}`  // Поменять ip адрес
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        if (data.videoId) {
          this.videoUrl = `http://192.168.102.120:3000/videos/${data.videoId}.mp4`   // Поменять ip адрес
        } else {
          throw new Error('Invalid response from server')
        }
      } catch (error) {
        console.error('Error in handleVideoUrl:', error)
        alert('Не удалось загрузить видео')
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
</style>
