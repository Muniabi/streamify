<template>
  <div class="video-player">
    <video controls :src="videoUrl" class="video-element"></video>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  }
})

// Используйте props.videoUrl в вашем шаблоне
const videoUrl = props.videoUrl
</script>

<style scoped>
.video-player {
  max-width: 800px;
  width: 100%;
  margin-top: 2rem;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: auto;
}
</style>
