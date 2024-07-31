<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useMessage } from 'naive-ui'

interface Props {
  imageUrl: string
  authToken: string
}

const props = defineProps<Props>()

const { imageUrl, authToken } = props

const imageSrc = ref('')

const fetchImageWithAuth = () => {
  axios.get(encodeURI(imageUrl), {
    headers: {
      auth: authToken,
    },
    responseType: 'arraybuffer',
  })
    .then((response) => {
      const imageBase64 = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      )
      imageSrc.value = `data:image/png;base64,${imageBase64}`
    })
    .catch((error) => {
      useMessage()?.error('Error fetching image:', error)
    })
}

onMounted(() => {
  fetchImageWithAuth()
})
</script>

<template>
  <div class="mb-1 w-full">
    <img :src="imageSrc" alt="Image">
  </div>
</template>
