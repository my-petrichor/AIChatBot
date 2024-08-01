<script setup lang='ts'>
import { ref } from 'vue'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'

interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  queryContent?: any
  regenerate?: boolean
  type?: string
  selectedContent?: string
  sourceDocumentsTypeData?: any
  generalQueryData?: any
  abstractData?: any
  shouldNotHaveRegenerateIcon?: any
}

const props = defineProps<Props>()


const textRef = ref<HTMLElement>()

const asRawText = ref(props.inversion)

const messageRef = ref<HTMLElement>()


</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}
      </p>
      <div
        class="flex items-end gap-1 mt-2"
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
      >
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :loading="loading"
          :query-content="queryContent"
          :as-raw-text="asRawText"
          :type="type"
          :selected-content="selectedContent"
          :source-documents-type-data="sourceDocumentsTypeData"
          :general-query-data="generalQueryData"
          :abstract-data="abstractData"
        />
        <div class="flex flex-col">
        </div>
      </div>
    </div>
  </div>
</template>
