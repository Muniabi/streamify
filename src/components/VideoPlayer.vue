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
            <video :src="videoUrl" controls></video>
          </div>
          <div class="convert-form">
            <label for="format">Выберите формат:</label>
            <select v-model="selectedFormat" id="format">
              <option value="mp4">MP4</option>
              <option value="webm">WEBM</option>
              <option value="avi">AVI</option>
            </select>
            <button @click="convertVideo" class="convert-button">Конвертировать</button>
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
      selectedFormat: 'mp4'
    }
  },
  methods: {
    downloadVideo() {
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a')
      link.href = this.videoUrl
      link.target = '_blank' // Открывает ссылку в новом окне
      link.download = '' // Не обязательно, но может указать, что это файл для скачивания
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link) // Удаляем ссылку после клика
    },
    openConvertModal() {
      this.showConvertModal = true
    },
    closeConvertModal() {
      this.showConvertModal = false
    },
    async convertVideo() {
      const response = await fetch(
        `http://localhost:3000/convert?url=${encodeURIComponent(this.videoUrl)}&format=${this.selectedFormat}`,
        {
          method: 'POST'
        }
      )

      if (response.ok) {
        const data = await response.json()
        const downloadUrl = `http://localhost:3000/videos/${data.videoId}.${this.selectedFormat}`
        // Создаем временную ссылку для скачивания
        const link = document.createElement('a')
        link.href = downloadUrl
        link.target = '_blank' // Открывает ссылку в новом окне
        link.download = '' // Не обязательно, но может указать, что это файл для скачивания
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link) // Удаляем ссылку после клика
        this.closeConvertModal()
      } else {
        alert('Ошибка при конвертации видео')
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
  flex-direction: column;
  background: #121212;
  border-radius: 10px;
  padding: 20px;
}

.close {
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  align-self: flex-end;
}

.modal-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview {
  flex: 1;
  margin-right: 20px;
}

.convert-form {
  flex: 1;
}

.convert-form label {
  display: block;
  margin-bottom: 10px;
}

.convert-form select {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #444;
  background-color: #222;
  color: #fff;
}

.convert-button {
  margin-top: 10px;
}
</style>
