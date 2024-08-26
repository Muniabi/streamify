<template>
  <div class="video-player">
    <video :src="videoUrl" controls></video>
    <div class="actions">
      <button @click="downloadVideo" class="action-button">Скачать</button>
      <button @click="openConvertModal" class="action-button">Конвертировать</button>
    </div>
    <!-- Модальное окно для конвертации видео -->
    <div v-if="showConvertModal" class="modal">
      <div class="modal-content">
        <span @click="closeConvertModal" class="close">&times;</span>
        <div class="modal-body">
          <div class="preview">
            <h3>Предпросмотр</h3>
            <video :src="videoUrl" controls></video>
          </div>
          <div class="convert-form">
            <label for="format">Выберите формат:</label>
            <select v-model="selectedFormat" id="format" class="format-select">
              <option value="avi">AVI</option>
              <option value="webm">WEBM</option>
            </select>
            <button @click="convertVideo" class="convert-button">Конвертировать</button>
            <div v-if="isConverting" class="status">
              <div class="status-message">Конвертируется...</div>
            </div>
            <div v-if="conversionDone" class="status success">
              <div class="status-message">
                Видео конвертировано <span class="success-icon">✔</span>
              </div>
              <button @click="downloadConvertedVideo" class="download-button">Скачать</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['videoUrl'],
  data() {
    return {
      showConvertModal: false,
      selectedFormat: 'avi',
      isConverting: false,
      conversionDone: false,
      convertedVideoUrl: ''
    }
  },
  methods: {
    downloadVideo() {
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a')
      link.href = this.videoUrl

      // Устанавливаем атрибут download для указания имени файла
      link.download = this.videoUrl.split('/').pop() // Использует имя файла из URL

      // Устанавливаем target='_blank' чтобы открыть ссылку в новой вкладке
      link.target = '_blank'

      // Добавляем ссылку на страницу
      document.body.appendChild(link)

      // Имитируем клик по ссылке для начала скачивания
      link.click()

      // Удаляем ссылку с страницы
      document.body.removeChild(link)
    },
    // Остальные методы
    openConvertModal() {
      this.showConvertModal = true
    },
    closeConvertModal() {
      this.showConvertModal = false
    },
    async convertVideo() {
      this.isConverting = true
      this.conversionDone = false

      const response = await fetch(
        `http://localhost:3000/convert?url=${encodeURIComponent(this.videoUrl)}&format=${this.selectedFormat}`,
        {
          method: 'POST'
        }
      )

      if (response.ok) {
        const data = await response.json()
        this.convertedVideoUrl = `http://localhost:3000/videos/${data.videoId}.${this.selectedFormat}`
        this.isConverting = false
        this.conversionDone = true
      } else {
        alert('Ошибка при конвертации видео')
        this.isConverting = false
      }
    },
    async downloadConvertedVideo() {
      try {
        const response = await fetch(this.convertedVideoUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        })

        if (!response.ok) throw new Error('Ошибка при загрузке видео')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // Создаем временную ссылку для скачивания
        const link = document.createElement('a')
        link.href = url
        link.download = `video.${this.selectedFormat}` // Устанавливаем имя файла
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url) // Очищаем созданный URL
      } catch (error) {
        console.error('Ошибка при скачивании видео:', error)
      }
    }
  }
}
</script>

<style scoped>
.video-player {
  display: flex;
  flex-direction: column;
  align-items: center;
}

video {
  max-width: 100%;
  border-radius: 10px;
}

.actions {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.action-button,
.convert-button {
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-button:hover,
.convert-button:hover {
  background-color: #555;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  display: flex;
  background: #121212;
  border-radius: 10px;
  padding: 20px;
  height: 70vh; /* Высота модального окна */
  position: relative; /* Для позиционирования крестика */
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  display: flex;
  width: 100%;
  height: 100%;
}

.preview {
  flex: 1;
  margin-right: 20px;
}

.preview h3 {
  color: #fff;
  margin-bottom: 10px;
}

.convert-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.convert-form label {
  margin-bottom: 10px;
  color: #fff;
}

.format-select,
.convert-button {
  margin-top: 10px;
}

.format-select {
  background-color: #222;
  color: #fff;
  border: 1px solid #444;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.status-message {
  font-size: 18px;
  color: #fff;
  margin-bottom: 20px;
}

.success {
  color: #4caf50;
}

.success-icon {
  color: #4caf50;
  font-size: 24px;
  margin-left: 10px;
}

.download-button {
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.download-button:hover {
  background-color: #4caf50; /* Зелёный цвет при наведении */
}
</style>
