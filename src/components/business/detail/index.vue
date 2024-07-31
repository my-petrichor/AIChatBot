<script setup lang="ts">
import { computed, defineProps, onMounted, ref, watch } from 'vue'
import _ from 'lodash'
import { useMessage } from 'naive-ui'
import knowledgeSummaryIcon from '@/assets/icon_知识库总结（未选）@2x.png'
import knowledgeSummarySelectedIcon from '@/assets/icon_知识库总结（选中）@2x.png'
import { useChatStore, useUserStore } from '@/store'
import { PostGenerateAbstractInMyKb, PostPreviewFileInMyKb } from '@/api/chat'
import DetailContent from '@/components/business/DetailContent/index.vue'
const props = defineProps({
  currentHeight: {
    type: String,
    required: false,
  },
})
const emit = defineEmits(['update:currentHeight'])
const detailRef = ref<any>(null)
const knowledgeContentRef = ref<any>('总结生成中...')
const detailContentRef = ref<any>({
  type: 0,
  data: '加载中...',
})
const chatStore = useChatStore()
const userStore = useUserStore()
const currentFolder = ref(chatStore.myFileList.find(ele => ele.selected)?.kb_name || '')
const currentSelectedFiles = ref(chatStore.myFileList.filter(ele => ele.selected)[0]?.children?.filter((ele: { isSelected: any }) => ele.isSelected)?.map((ele: { name: any }) => ele.name) || [])

const currentMyFileList = computed(() => chatStore.myFileList)
const accessToken = computed(() => userStore.accessToken)
const tagsInDetailContetent = ref(currentMyFileList.value.filter(ele => ele.selected)[0]?.children?.map((ele: { name: any }, index: number) => ({ name: ele.name, selected: index === 0 })))

const mode = ref(1)
const ModeInReadFile = ref(tagsInDetailContetent.value?.find((ele: { selected: any }) => ele.selected)?.name)
const tags = ref([
  {
    name: '知识库总结',
    icon: knowledgeSummaryIcon,
    iconSelected: knowledgeSummarySelectedIcon,
    id: 1,
    selected: true,
  },
])
const currentHeight = props.currentHeight
const handleMouseDown = (event: { target: any; clientY: any }) => {
  if ((detailRef?.value as HTMLElement).style.cursor !== 's-resize')
    return
  const detail = event.target
  const startY = event.clientY
  const startHeight = parseInt(window.getComputedStyle(detail).height)

  const handleMouseMove = (event: { clientY: number }) => {
    const deltaY = event.clientY - startY
    const newHeight = startHeight + deltaY
    if (newHeight < 0.2 * window.innerHeight || newHeight > 0.8 * window.innerHeight)
      return
    detail.style.height = `${newHeight}px`
    emit('update:currentHeight', newHeight)
  }

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}
const handleMouseMove = (event: MouseEvent) => {
  // Get the position of the mouse cursor relative to the element
  const rect = (detailRef?.value as HTMLElement)?.getBoundingClientRect()
  const mouseY = event.clientY - rect?.top

  // Set a threshold (e.g., 10 pixels) to define the "bottom border" region
  const threshold = 10

  // Check if the mouse cursor is near the bottom border
  if (rect.height - mouseY <= threshold)
    (detailRef?.value as HTMLElement).style.cursor = 's-resize'

  else
    (detailRef?.value as HTMLElement).style.cursor = 'auto'
}
const clickTag = (_e: any, index: number) => {
  tags.value = tags.value.map((ele, i) => ({
    ...ele,
    selected: i === index,
  }))
}
const clickFileTag = (_e: any, index: number) => {
  tagsInDetailContetent.value = tagsInDetailContetent.value.map((ele: any, i: number) => ({
    ...ele,
    selected: i === index,
  }))
}

const debouncedPostGenerateAbstractInMyKb = _.debounce((payload: { files_name: any[] }, auth: string) => {
  PostGenerateAbstractInMyKb([payload], auth)
    .then((res) => {
      if (payload.files_name.length === 1)
        knowledgeContentRef.value = `${res.data.data.file_abstract?.map((ele: { name: any; abstract: any }) => `文件名称：${ele.name}\n总结：${ele.abstract}\n`).join('\n') || ''}`

      else
        knowledgeContentRef.value = `${res.data.data.kb_abstract ? ('知识库总结:' + `\n${res.data.data.kb_abstract.abstract}` + '\n') : ''}` + `${res.data.data.file_abstract?.map((ele: { name: any; abstract: any }) => `文件名称：${ele.name}\n总结：${ele.abstract}\n`).join('\n') || ''}`
    })
    .catch((err) => {
      if (err === 401)
        useMessage().error('401,请重新登录')
      knowledgeContentRef.value = '总结生成失败'
    })
}, 1500)

watch(() => tags.value, (newVal, _oldVal) => {
  const seletedTag = newVal.find(ele => ele.selected)
  mode.value = (seletedTag?.id as any)
}, {
  deep: true,
},
)
watch(() => tagsInDetailContetent.value, (newVal, _oldVal) => {
  const seletedTag = newVal?.find((ele: { selected: any }) => ele.selected)
  ModeInReadFile.value = seletedTag?.name
}, {
  deep: true,
},
)

watch([chatStore], ([newValue1]) => {
  currentFolder.value = newValue1.myFileList.find(ele => ele.selected)?.kb_name
  if (
    !_.isEqual(currentSelectedFiles.value, newValue1.myFileList.filter(ele => ele.selected)[0]?.children?.filter((ele: { isSelected: any }) => ele.isSelected)?.map((ele: { name: any }) => ele.name))
  )
    currentSelectedFiles.value = newValue1.myFileList.filter(ele => ele.selected)[0]?.children.filter((ele: { isSelected: any }) => ele.isSelected).map((ele: { name: any }) => ele.name)
}, {
  deep: true,
})

watch(() => currentMyFileList.value, (newVal, oldVal) => {
  if (newVal.map((ele: { selected: any }) => ele.selected).join('') !== oldVal.map((ele: { selected: any }) => ele.selected).join('') || newVal.find((ele: { selected: any }) => ele.selected).childrenString.length !== oldVal.find((ele: { selected: any }) => ele.selected).length)
    tagsInDetailContetent.value = newVal.find(ele => ele.selected)?.children?.map((ele: { name: any }, index: number) => ({ name: ele.name, selected: index === 0 }))
}, {
  deep: true,
})

watch([currentFolder, currentSelectedFiles], ([newValue1, newValue2], [oldValue1, oldValue2]) => {
  // 先判断该目录下是否有文件，没有文件不需要请求接口，直接显示以下文案
  if (!(newValue2 && newValue2.length !== 0)) {
    knowledgeContentRef.value = '没有文件可总结，请先上传文件'
    return
  }

  const payload = {
    kb_name: newValue1,
    files_name: newValue2,
  }
  const auth = accessToken?.value || ''
  knowledgeContentRef.value = '总结生成中...'
  debouncedPostGenerateAbstractInMyKb(payload, auth)
}, {
  deep: true,
})

watch([ModeInReadFile, mode], ([newValue1, newValue2]) => {
  if (mode.value === 2) {
    // send request for red file
    const payload = {
      file_name: newValue1,
      kb_name: chatStore.myFileList.find(ele => ele.selected).kb_name,
    }
    detailContentRef.value = {
      type: 0,
      data: '加载中...',
    }
    PostPreviewFileInMyKb(payload, accessToken?.value || '').then((res) => {
      switch (res.data.code) {
        case 200:
          detailContentRef.value = res.data
          break
        case 401:
          useMessage().error('登录过期，请重新登录')
          break
        default:
          break
      }
    }).catch((_err) => {
      detailContentRef.value = {
        type: 99,
        data: '文件预览失败',
      }
    })
  }
})

onMounted(() => {
  const kb_name = chatStore.myFileList.find(ele => ele.selected)?.kb_name
  const files_name = chatStore.myFileList.filter(ele => ele.selected)[0].children.filter((ele: { isSelected: any }) => ele.isSelected).map((ele: { name: any }) => ele.name)
  const payload = {
    kb_name,
    files_name,
  }
  // 先判断该目录下是否有文件，没有文件不需要请求接口，直接显示以下文案
  if (!(files_name && files_name.length !== 0)) {
    knowledgeContentRef.value = '没有文件可总结，请先上传文件'
    return
  }
  const auth = accessToken?.value || ''
  PostGenerateAbstractInMyKb([payload], auth).then((res) => {
    if (files_name.length === 1)
      knowledgeContentRef.value = `${res.data.data.file_abstract?.map((ele: { name: any; abstract: any }) => `文件名称：${ele.name}\n总结：${ele.abstract}\n`).join('\n') || ''}`

    else
      knowledgeContentRef.value = `${res.data.data.kb_abstract ? ('知识库总结:' + `\n${res.data.data.kb_abstract.abstract}` + '\n') : ''}` + `${res.data.data.file_abstract?.map((ele: { name: any; abstract: any }) => `文件名称：${ele.name}\n总结：${ele.abstract}\n`).join('\n') || ''}`
  }).catch((_err) => {
    knowledgeContentRef.value = '总结生成失败'
  })
})
</script>

<template>
  <div
    ref="detailRef" class="detail p-5" :style="`height: ${currentHeight};`" @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
  >
    <div class="tags mb-5">
      <div
        v-for="(item, index) in tags" :key="item.id" class="mr-5"
        :class="{ tagClicked: item.selected, tag: !item.selected }" @click="clickTag($event, index)"
      >
        <span>
          <img class="icon mr-1" :src="item.selected ? item.iconSelected : item.icon">
        </span>
        <span> {{ item.name }}
        </span>
      </div>
    </div>
    <div class="separateLine mb-5" />
    <div v-if="mode === 1" class="knowledgeContent">
      {{ knowledgeContentRef }}
    </div>
    <div v-if="mode === 2" class="fileContent">
      <div v-if="tagsInDetailContetent.length" class="fileDetailTags">
        <div
          v-for="(item, index) in tagsInDetailContetent" :key="item.name" class="mr-1 mb-1"
          :class="{ fileTagSelected: item.selected, fileTag: !item.selected }" @click="clickFileTag($event, index)"
        >
          {{
            item.name }}
        </div>
      </div>
      <DetailContent
        v-if="tagsInDetailContetent.length" :type="detailContentRef.type" :data="detailContentRef.data"
        :auth-token="accessToken || ''"
      />
      <div v-if="!tagsInDetailContetent.length" class="fileDetailTags">
        没有文件阅读
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.detail {
  width: 100%;
  background: #1c1e25;
  border-radius: 4px;
  opacity: 1;
  margin-bottom: 4px;
  max-height: 80%;
  min-height: 20%;
  position: relative;
  display: flex;
  flex-direction: column;

  .tags {
    display: flex;
    justify-content: flex-start;
    widows: 100%;

    .tagClicked {
      padding: 1px;
      width: 150px;
      height: 40px;
      background: linear-gradient(270deg, #4D46FD 0%, #506BFF 100%);
      border-radius: 40px 40px 40px 40px;
      opacity: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
    }

    .tag {
      padding: 1px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 150px;
      height: 40px;
      border-radius: 40px 40px 40px 40px;
      background: linear-gradient(270deg, #4D46FD33 0%, #506BFF33 100%);
      border-radius: 40px 40px 40px 40px;
      opacity: 1;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.7);
      line-height: 0px;
    }

    .tag:hover {
      background: linear-gradient(270deg, #4D46FD4C 0%, #506BFF4C 100%);
    }
  }

  .separateLine {
    width: 100%;
    height: 1px;
    background: #2E313C;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
  }

  .knowledgeContent {
    width: 100%;
    height: 100%;
    background: #1c1e25;
    border-radius: 4px 4px 4px 4px;
    margin: 4px 4px 4px 0px;
    position: relative;
    overflow: scroll;
    scrollbar-width: none;
    white-space: pre-wrap;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Hide the scrollbar */
  .knowledgeContent::-webkit-scrollbar {
    width: 0.5em;
  }

  .knowledgeContent::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .knowledgeContent::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  .fileContent {
    width: 100%;
    height: 100%;
    background: #1c1e25;
    border-radius: 4px 4px 4px 4px;
    margin: 4px 4px 4px 0px;
    position: relative;
    overflow: scroll;
    scrollbar-width: none;

    // .fileDetailTags {
    //   display: flex;
    //   justify-content: flex-start;
    //   widows: 100%;
    //   flex-wrap: wrap;

    //   .fileTag {
    //     padding: 5px;

    //     width: 69px;
    //     height: 26px;
    //     background: rgba(255, 255, 255, 0.1);
    //     border-radius: 14px 14px 14px 14px;
    //     opacity: 1;
    //     border: 1px solid rgba(255, 255, 255, 0.15);
    //     display: flex;
    //     justify-content: center;
    //     align-items: center;
    //     display: flex;
    //     text-wrap: nowrap;
    //     width: fit-content;
    //     text-overflow: ellipsis;
    //   }
    // }

    // .fileTagSelected {
    //   padding: 5px;
    //   width: 69px;
    //   height: 26px;
    //   background: rgba(96, 127, 255, 0.2);
    //   border-radius: 14px 14px 14px 14px;
    //   opacity: 1;
    //   border: 1px solid #607FFF;
    //   display: flex;
    //   justify-content: center;
    //   align-items: center;
    //   display: flex;
    //   width: fit-content;
    //   text-wrap: nowrap;
    //   text-overflow: ellipsis;
    // }

  }
}
</style>
