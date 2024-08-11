<template>
  <div class="video-form">
    <form @submit.prevent="submitForm">
      <input
        type="text"
        v-model="videoUrl"
        placeholder="Enter YouTube video URL"
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
.video-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.url-input {
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  width: 300px;
  margin-inline: 10px;
  margin-bottom: 1rem;
}

.submit-button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: #1e88e5;
  color: white;
  border: none;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #1565c0;
}
</style>
