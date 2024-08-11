<template>
  <div class="user-counter">
    <svg class="status-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" />
    </svg>
    Online: {{ activeUsers }}
  </div>
</template>

<script>
import io from 'socket.io-client'

export default {
  data() {
    return {
      activeUsers: 0
    }
  },
  mounted() {
    const socket = io('http://localhost:3000') // Подключаемся к серверу

    socket.on('userCount', (count) => {
      this.activeUsers = count
    })
  }
}
</script>

<style scoped>
.user-counter {
  display: flex;
  align-items: center;
  color: white;
  margin-top: 10px;
}

.status-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  fill: #32cd32; /* Лаймовый цвет */
  filter: drop-shadow(0 0 8px #00ff00); /* Неоновая тень */
}

.status-icon circle {
  cx: 50;
  cy: 50;
  r: 40;
}
</style>
