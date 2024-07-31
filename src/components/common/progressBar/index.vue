<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  progress: Number, // The progress value (0-100)
})

const progressBarWidth = computed(() => `${props.progress}%`)
const progressBarText = computed(() => `${props.progress}%`)
</script>

<template>
  <div class="progress">
    <div class="progress-bar" :style="{ width: progressBarWidth }">
      {{ progressBarText }}
    </div>
  </div>
</template>

  <style scoped>
  .progress {
    width: 100%;
    background-color: #f0f0f0;
    height: 20px;
  }

  .progress-bar {
    background-color: #007bff;
    height: 100%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
