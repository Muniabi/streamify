<template>
  <div class="video-form">
    <form @submit.prevent="submitForm" class="form">
      <input
        type="text"
        v-model="videoUrl"
        placeholder="Введите URL-адрес видео на YouTube"
        class="url-input"
      />
      <button type="submit" class="submit-button">Load Video</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const videoUrl = ref('')

const emit = defineEmits(['video-url-submitted'])

const submitForm = () => {
  if (videoUrl.value) {
    emit('video-url-submitted', videoUrl.value)
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.video-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* margin-top: 2rem; */
}

@media (max-width: 600px) {
  .form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
}

.url-input {
  font-size: 16px;
  padding: 0.6rem;
  border-radius: 8px;
  border: none;
  width: 340px;
  margin-inline: 10px;
  margin-bottom: 0.5rem;
}

.submit-button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 14px;
  background-color: #1e88e5;
  color: white;
  border: none;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #2583ed;
}
</style>
