<script setup lang="ts">
import { computed, defineProps, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  useMessage,
} from 'naive-ui'
import 'novel-vue/dist/style.css'
import _ from 'lodash'
import knowledgeSummaryIcon from '@/assets/icon_知识库总结（未选）@2x.png'
import knowledgeSummarySelectedIcon from '@/assets/icon_知识库总结（选中）@2x.png'
import fileSummaryIcon from '@/assets/icon_阅读文件（未选）@2x.png'
import fileSummarySelectedIcon from '@/assets/icon_阅读文件（选中）@2x.png'
import DetailContent from '@/components/business/DetailContent/index.vue'
import { PostPreviewFileInMyKb } from '@/api/chat'
import { useChatStore, useUserStore } from '@/store'
import Note from '@/components/business/note/index.vue'
interface Props {
  maxWidth: any
}
const props = defineProps<Props>()
const emitCurrentWidth = defineEmits(['update:currentWidth'])
const minWidth = 300
const maxWidth = computed(() => (props.maxWidth))
const chatStore = useChatStore()
const resizableRight = ref<any>(null)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)
// for asking selected content in the future
const selectedText = ref('')
const selectedTextLength = ref(0)
const panelWidth = ref('')
const currentChatMode = computed(() => chatStore.chatMode)
const mode = ref(1)

const allTags = [
  {
    name: '阅读文件',
    icon: fileSummaryIcon,
    iconSelected: fileSummarySelectedIcon,
    id: 2,
    selected: false,
  },
  {
    name: '笔记',
    icon: knowledgeSummaryIcon,
    iconSelected: knowledgeSummarySelectedIcon,
    id: 1,
    selected: true,
  },
]

const tags = ref([allTags[1]])

const handleSelectionChange = () => {
  const selection: any = window.getSelection()
  selectedText.value = selection.toString()
  selectedTextLength.value = selectedText.value.length
}
const resize = (e: { clientX: number }) => {
  if (!isResizing.value)
    return
  const offsetX = startX.value - e.clientX
	const temp = startWidth.value + offsetX * 1
  const newWidth = temp > maxWidth.value ? maxWidth.value : temp
  emitCurrentWidth('update:currentWidth', newWidth < minWidth ? minWidth : newWidth)
}
const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResize)
  panelWidth.value = getComputedStyle(resizableRight.value).width
}
const startResize = (e: { clientX: number; preventDefault: () => void }) => {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = parseFloat(getComputedStyle(resizableRight.value).width)
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', stopResize)
  e.preventDefault() // Prevent text selection during dragging
}
const handleResize = () => {
  panelWidth.value = resizableRight.value.width
}
const detailContentRef = ref<any>({
  type: 0,
  data: '加载中...',
})
const currentFolder = ref(chatStore.myFileList.find(ele => ele.selected)?.kb_name || '')
const currentSelectedFiles = ref(chatStore.myFileList.filter(ele => ele.selected)[0]?.children?.filter((ele: { isSelected: any }) => ele.isSelected)?.map((ele: { name: any }) => ele.name) || [])

const currentMyFileList = computed(() => chatStore.myFileList)
const tagsInDetailContetent = ref(currentMyFileList.value.filter(ele => ele.selected)[0]?.children?.map((ele: { name: any }, index: number) => ({ name: ele.name, selected: index === 0 })))

const ModeInReadFile = ref(tagsInDetailContetent.value?.find((ele: { selected: any }) => ele.selected)?.name)

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
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('mouseup', handleSelectionChange)
})
onMounted(() => {
  window.addEventListener('mouseup', handleSelectionChange)
  window.addEventListener('resize', handleResize)
  // handleResize()
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleSelectionChange)
  window.removeEventListener('resize', handleResize)
})

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
  if (currentChatMode.value === 2) {
    if (newVal.map((ele: { selected: any }) => ele.selected).join('') !== oldVal.map((ele: { selected: any }) => ele.selected).join('') || newVal.find((ele: { selected: any }) => ele.selected).childrenString.length !== oldVal.find((ele: { selected: any }) => ele.selected).length)
      tagsInDetailContetent.value = newVal.find(ele => ele.selected)?.children?.map((ele: { name: any }, index: number) => ({ name: ele.name, selected: index === 0 }))
  }
}, {
  deep: true,
})

watch([ModeInReadFile, currentChatMode], ([newValue1]) => {
  if (currentChatMode.value === 1)
    tags.value = [allTags[1]]

  if (currentChatMode.value === 2) {
    tags.value = allTags.map((ele, i) => ({
      ...ele,
      selected: i === 0,
    }))
    const payload = {
      file_name: newValue1,
      kb_name: chatStore.myFileList?.find(ele => ele.selected)?.kb_name || '',
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
</script>

<template>
  <div ref="resizableRight" class="rightSide">
    <div class="resize-handle" @mousedown="startResize" />
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
    <div v-if="accessToken && currentChatMode === 2 && mode === 2" style="height: 100%;overflow: scroll !important;">
      <div v-if="tagsInDetailContetent?.length" class="fileDetailTags">
        <div
          v-for="(item, index) in tagsInDetailContetent" :key="item.name" class="mr-1 mb-1 tag"
          :class="{ fileTagSelected: item.selected, fileTag: !item.selected }" :title="item.name"
          @click="clickFileTag($event, index)"
        >
          {{
            item.name }}
        </div>
      </div>
      <DetailContent
        v-if="tagsInDetailContetent?.length" :type="detailContentRef.type" :data="detailContentRef.data"
        :auth-token="accessToken || ''"
        :panel-width="panelWidth"
      />
      <div v-if="!tagsInDetailContetent?.length" class="fileDetailTags">
        没有文件阅读
      </div>
    </div>
    <div v-if="accessToken && mode === 1" style="height: 100%;overflow: scroll !important;">
      <Note />
    </div>
  </div>
</template>

<style scoped lang="less">
.rightSide {
  padding: 10px;

  .resize-handle {
    width: 8px;
    height: 100%;
    background-color: #20232B;
    position: absolute;
    top: 0;
    left: -4px;
    cursor: col-resize;
  }

  .tags {
    display: flex;
    justify-content: flex-start;
    widows: 100%;
    margin-left: 10px;

    .tagClicked {
      padding: 1px;
      width: 120px;
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
      width: 120px;
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

  .listContent {
    .header {
      display: flex;
      justify-content: space-between;

      .createNote {
        width: 93px;
        height: 36px;
        border-radius: 4px 4px 4px 4px;
        opacity: 1;
        border: 1px solid #607FFF;
        font-size: 14px;
        font-weight: bold;
        color: #607FFF;
        line-height: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .createNote:hover {
        background: rgba(96, 127, 255, 0.2);
        border-radius: 4px 4px 4px 4px;
        opacity: 1;
        border: 1px solid #607FFF;
        color: #607FFF;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .text {
        font-size: 16px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.5);
        line-height: 26px;
        margin-bottom: 30px;
        margin-top: 50px;
        text-align: center;
      }

      .loginButton {
        width: 180px;
        height: 50px;
        border-radius: 10px 10px 10px 10px;
        opacity: 1;
        border: 1px solid #607FFF;
        font-size: 18px;
        font-weight: 400;
        color: #607FFF;
        line-height: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .loginButton:hover {
        background: rgba(96, 127, 255, 0.2);

      }
    }

    .LoginContent {
      .noteListItem {
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.7);
      }

      .noteListItem:hover {
        background: #2E313C;

        .moreButton {
          display: block;
        }
      }

      .moreButton {
        display: none;
      }

    }
  }

  .addNoteContent {
    .header {
      display: flex;
      justify-content: space-between;

      .icon14 {
        width: 14px;
        height: 14px;
        border-radius: 0px 0px 0px 0px;
        opacity: 1;
        margin-right: 8px;
      }

      .title {
        font-size: 14px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.7);
        line-height: 0px;
      }

      .saveNote {
        width: 93px;
        height: 36px;
        border-radius: 4px 4px 4px 4px;
        opacity: 1;
        border: 1px solid #607FFF;
        font-size: 14px;
        font-weight: bold;
        color: #607FFF;
        line-height: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .saveNote:hover {
        background: rgba(96, 127, 255, 0.2);
        border-radius: 4px 4px 4px 4px;
        opacity: 1;
        border: 1px solid #607FFF;
        color: #607FFF;
      }
    }

    .noteTitle {
      width: 100%;
      background: #2E313C;
      border-radius: 10px 10px 10px 10px;
      opacity: 1;
    }
  }

  .fileDetailTags {
    display: flex;
    justify-content: flex-start;
    widows: 100%;
    flex-wrap: wrap;

    .tag {
      padding: 5px;
      display: flex;
      justify-content: left;
      height: 26px;
      overflow-x: hidden;
      overflow-y: hidden;
      text-wrap: nowrap;
      text-overflow: ellipsis;
      max-width: 80%;
      align-items: center;
    }

    .fileTag {

      background: rgba(255, 255, 255, 0.1);
      border-radius: 14px 14px 14px 14px;
      opacity: 1;
      border: 1px solid rgba(255, 255, 255, 0.15);

    }
  }

  .fileTagSelected {

    background: rgba(96, 127, 255, 0.2);
    border-radius: 14px 14px 14px 14px;
    opacity: 1;
    border: 1px solid #607FFF;

  }

}
</style>
