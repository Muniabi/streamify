<template>
  <div class="loader">
    <div class="progress-bar">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>
    <p>
      {{ progress.toFixed(2) }}% | {{ downloadedMB }} MB из {{ totalMB }} MB | Скорость:
      {{ speed }} KB/s
    </p>
  </div>
</template>

<script>
import io from 'socket.io-client'

export default {
  data() {
    return {
      progress: 0,
      downloadedMB: 0,
      totalMB: 0,
      speed: 0
    }
  },
  mounted() {
    this.initSocket()
  },
  methods: {
    initSocket() {
      const socket = io('http://localhost:3000')

      socket.on('download-progress', (data) => {
        this.progress = data.progress
        this.downloadedMB = (data.downloadedBytes / 1024 / 1024).toFixed(2)
        this.totalMB = (data.totalBytes / 1024 / 1024).toFixed(2)
        this.speed = data.speed.toFixed(2)
      })
    }
  }
}
</script>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  color: white;
}

.progress-bar {
  width: 80%;
  background-color: #333;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress {
  height: 10px;
  background-color: lime;
  transition: width 0.2s;
}
</style>
