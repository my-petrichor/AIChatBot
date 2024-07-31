<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useMessage } from 'naive-ui'
import VuePdfEmbed from 'vue-pdf-embed'
const props = defineProps<Props>()

interface Props {
  pdfUrl: string
  authToken: string
  panelWidth: string | any
}

const { pdfUrl, authToken, panelWidth } = props

const pdf = ref('')
const pdfContainerRef = ref(null)
const isLoading = ref(true)
const fetchPDFWithAuth = () => {
  axios.get(encodeURI(pdfUrl), {
    headers: {
      auth: authToken,
    },
    responseType: 'arraybuffer',
  })
    .then((response) => {
      const imageBase64 = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      )
      pdf.value = `data:application/pdf;base64,${imageBase64}`
    })
    .catch((error) => {
      useMessage().error('Error fetching image:', error)
    })
}
const handleDocumentRender = (args: any) => {
  isLoading.value = false
}
onMounted(() => {
  fetchPDFWithAuth()
})
</script>

<template>
  <div ref="pdfContainerRef" class="mb-1 w-full">
    <div v-if="isLoading">
      加载中...
    </div>
    <VuePdfEmbed
      :key="panelWidth" class="w-full"
      :source="{
        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
        url: pdf,
        cMapPacked: true,
      }"
      text-layer
      annotation-layer
      @rendered="handleDocumentRender"
    />
  </div>
</template>

<style scoped lang="less">

</style>
