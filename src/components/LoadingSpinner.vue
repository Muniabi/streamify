<template>
  <div class="loader">
    <!-- Пульсирующий круг и текст "Идет подготовка..." отображается, если isDownloading == false -->
    <div v-if="!isDownloading" class="preparation">
      <div class="pulse-circle"></div>
      <p>Идет подготовка...</p>
    </div>
    <!-- Прогресс-бар отображается, если isDownloading == true -->
    <transition name="fade">
      <div v-if="isDownloading" class="progress-container">
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
        <p>
          {{ progress.toFixed(2) }}% | {{ downloadedMB }} MB из {{ totalMB }} MB | Скорость:
          {{ speed }} KB/s
        </p>
      </div>
    </transition>
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
      speed: 0,
      isDownloading: false
    }
  },
  mounted() {
    this.initSocket()
  },
  methods: {
    initSocket() {
      const socket = io('http://localhost:3000')

      socket.on('download-progress', (data) => {
        this.isDownloading = true // Устанавливаем флаг, когда начинается загрузка
        this.progress = data.progress
        this.downloadedMB = (data.downloadedBytes / 1024 / 1024).toFixed(2)
        this.totalMB = (data.totalBytes / 1024 / 1024).toFixed(2)
        this.speed = (data.speed / 1024).toFixed(2) // Преобразование скорости в KB/s
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

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  color: white;
}

.preparation {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pulse-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #32cd32; /* Lime green */
  animation: pulse 1.5s infinite ease-in-out;
  margin-bottom: 15px;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    background-color: #005f00; /* Darker green */
  }
  50% {
    transform: scale(1.1);
    background-color: #32cd32; /* Bright green */
  }
  100% {
    transform: scale(0.9);
    background-color: #005f00;
  }
}

.preparation p {
  font-size: 1.5rem;
  font-weight: bold;
}

.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
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

/* Fade transition between preparation and download progress */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
