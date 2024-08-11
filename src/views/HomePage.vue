<template>
  <div id="app">
    <header>
      <h1>Video Downloader</h1>
    </header>
    <main>
      <VideoForm @video-url-submitted="handleVideoUrl" />
      <VideoPlayer v-if="videoUrl" :videoUrl="videoUrl" />
      <UserCounter />
      <!-- Добавляем компонент счетчика пользователей -->
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VideoForm from '../components/VideoForm.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import UserCounter from '../components/UserCounter.vue' // Импортируем компонент счетчика пользователей

const videoUrl = ref('')

const handleVideoUrl = (url) => {
  videoUrl.value = url
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
