<script setup lang="ts">
import { computed, defineProps, h, nextTick, onMounted, reactive, ref } from 'vue'
import { NButton, NDropdown, NInput, NModal, NScrollbar, useMessage } from 'naive-ui'
import VueMarkdown from 'vue-markdown-render'
import ImageCustom from '@/components/common/Image/index.vue'
import PDF from '@/components/common/Pdf/index.vue'
import { postAddNote, postEditNote, postNoteList } from '@/api/chat'
import { useChatStore, useUserStore } from '@/store'
import 'novel-vue/dist/style.css'
// eslint-disable-next-line import/order
import { common, createLowlight } from 'lowlight'
// eslint-disable-next-line import/order
import {
  // necessary extensions
  Doc,
  Text,
  // eslint-disable-next-line sort-imports
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Strike,
  Link,
  Image,
  Blockquote,
  BulletList,
  OrderedList,
  TaskList,
  TextAlign,
  Indent,
  HardBreak,
  HorizontalRule,
  Fullscreen,
  History,
  CodeBlockLowlight,
} from 'element-tiptap-vue3-fixed'
interface Props {
  type: Number
  data: any
  authToken: string
  panelWidth?: string
}

const props = defineProps<Props>()
const chatStore = useChatStore()
const detailContentDivRef = ref(null)
const componentRect = reactive({ bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 })
const showSelectNoteModal = ref(false)
const showNoteEditorModal = ref(false)
const showDropdown = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const selectedNoteText = ref('')
const selectedNoteTextLength = ref(0)
const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)
const message = useMessage()
const noteList = ref<any>([])
const getNotelist = () => {
  if (accessToken.value) {
    postNoteList(accessToken.value).then((res: any) => {
      noteList.value = res.data.data.map((ele: any) => ({
        ...ele,
        isRenaming: false,
      }))
    }).catch((err: any) => {
      if (err === 401) {
        message.error('401,请重新登录')
        userStore.setAccessToken('')
      }
    })
  }
}

const handleSelect = (event: MouseEvent) => {
  event.preventDefault()
  if ([showDropdown.value, showSelectNoteModal.value, showNoteEditorModal.value].every(value => value === false)) {
    const selection: any = window.getSelection()
    if (selection.toString().trim() !== '' && selectedNoteText.value !== selection.toString().trim()) {
      selectedNoteText.value = selection.toString().trim()
      selectedNoteTextLength.value = selectedNoteText.value.length
      console.log('selectedNoteText in handleSelect func:', selectedNoteText.value)
      nextTick().then(() => {
        showDropdown.value = true
        mouseX.value = event.clientX
        mouseY.value = event.clientY
      })
    }
  }
}

// const renderCustomContextMenuHeader = () => {
//   const closeContextMenu = () => {
//     showDropdown.value = false
//   }
//   return h('div',
//     {
//       style: 'display: flex; justify-content: flex-end; padding: 4px 12px;',
//     },
//     [
//       h(NButton, { type: 'default', size: 'tiny', text: true, onClick: closeContextMenu }, { default: () => 'x' }),
//     ])
// }

const contextMenuOptions = [
  // {
  //   key: 'header',
  //   type: 'render',
  //   render: renderCustomContextMenuHeader,
  // },
  {
    label: '记入笔记',
    key: 'addToNote',
  },
  {
    label: '基于选中内容回答',
    key: 'askForSelected',
  },
]

const getDivPosition = () => {
  const componentElement = document.querySelector('.detailContentDiv')?.getBoundingClientRect()
  if (componentElement) {
    componentRect.bottom = componentElement.bottom
    componentRect.height = componentElement.height
    componentRect.left = componentElement.left
    componentRect.right = componentElement.right
    componentRect.top = componentElement.top
    componentRect.width = componentElement.width
    componentRect.x = componentElement.x
    componentRect.y = componentElement.y
  }
}
const onClickoutsideDropdown = (event: MouseEvent) => {
  showDropdown.value = false
  selectedNoteText.value = ''
  selectedNoteTextLength.value = 0
  console.log('selectedNoteText in onClickoutsideDropdown func:', selectedNoteText.value)
  // getDivPosition()
  // console.log('组件坐标信息:', componentRect)
  // const mouseX = event.clientX
  // const mouseY = event.clientY
  // if (
  //   mouseX >= componentRect.left
  //   && mouseX <= componentRect.right
  //   && mouseY >= componentRect.top
  //   && mouseY <= componentRect.bottom
  // ) {
  //   console.log('鼠标在组件范围内')
  //   showDropdown.value = false
  //   selectedNoteText.value = ''
  //   selectedNoteTextLength.value = 0
  //   console.log('selectedNoteText in onClickoutsideDropdown func:', selectedNoteText.value)
  // }

  // else {
  //   console.log('鼠标在组件范围外')
  // }
}
const handleDropdownSelect = (key: string | number) => {
  console.log('selectedNoteText in handleDropdownSelect func:', selectedNoteText.value)
  showDropdown.value = false
  getDivPosition()
  switch (key) {
    case 'addToNote':
      showSelectNoteModal.value = true
      break

    case 'askForSelected':
      chatStore.setQuote(selectedNoteText.value.trim())
      break

    default:
      break
  }
}

const noteMode = ref('list')
const selectedNoteTitle = ref('123')
const noteModel = ref('')
const addNote = () => {
  getDivPosition()
  console.log('selectedNoteText in addNote func:', selectedNoteText.value)
  selectedNoteTitle.value = `新笔记${noteList.value.length}`
  noteMode.value = 'addNote'
  noteModel.value = selectedNoteText.value
  showSelectNoteModal.value = false
  showNoteEditorModal.value = true
}
const handleClickNoteItem = (e: { stopPropagation: () => void; preventDefault: () => void; cancelBubble: boolean }, item: any) => {
  e.stopPropagation()
  e.preventDefault()
  console.log('selectedNoteText in handleClickNoteItem func:', selectedNoteText.value)
  getDivPosition()
  e.cancelBubble = true
  selectedNoteTitle.value = item.name
  noteMode.value = 'editNote'
  noteModel.value = `<p>${item.content}</p><p>${selectedNoteText.value}</p>`
  showSelectNoteModal.value = false
  showNoteEditorModal.value = true
}
const lowlight = createLowlight(common)
const extensions = [
  Doc,
  Text,
  Paragraph,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Heading.configure({ level: 5, bubble: true }),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Bold.configure({ bubble: true }), // render command-button in bubble menu.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Underline.configure({ bubble: true, menubar: false }), // render command-button in bubble menu but not in menubar.
  Italic,
  Strike,
  BulletList,
  OrderedList,
  TaskList,
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Link,
  Image,
  Blockquote,
  TextAlign,
  Indent,
  HardBreak,
  HorizontalRule,
  Fullscreen,
  History,
]
const saveNote = (showMessage: boolean) => {
  switch (noteMode.value) {
    case 'addNote':
      postAddNote({
        note_book_name: selectedNoteTitle.value,
        content: noteModel.value,
      }, accessToken.value).then(() => {
        getNotelist()
        if (showMessage)
          message.success('保存成功')
      },

      ).catch((err: any) => {
        console.log('err in  ss', err)
        if (err === 401)
          message.error('401,请重新登录')
        if (showMessage)
          message.error('保存失败')
      })

      break
    case 'editNote':
      postEditNote({
        note_book_name: selectedNoteTitle.value,
        content: noteModel.value,
      }, accessToken.value).then((res: any) => {
        switch (res.data.code) {
          case 200:

            getNotelist()
            message.success('保存成功')
            break
          case 201:
            message.info('笔记不存在')
            break
          default:
            break
        }
      }).catch((err: any) => {
        if (err === 401)
          message.error('401,请重新登录')
        message.error('保存失败')
      })
      break
    default:
      break
  }
}
const clickNoteReturnButton = () => {
  saveNote(false)
  noteMode.value = 'list'
  selectedNoteTitle.value = ''
  noteModel.value = ''
  showSelectNoteModal.value = true
  showNoteEditorModal.value = false
}
const clickNoteSaveButton = () => {
  saveNote(true)
  noteMode.value = 'list'
  selectedNoteTitle.value = ''
  noteModel.value = ''
  showSelectNoteModal.value = false
  showNoteEditorModal.value = false
}
onMounted(() => {
  getNotelist()
})
</script>

<template>
  <div ref="detailContentDivRef" class="detailContentDiv" @mouseup="handleSelect">
    <div v-if="props.type === 0">
      {{ props.data || '加载中' }}
    </div>
    <div v-if="props.type === 1">
      <PDF :pdf-url="`/api${props.data}`" :auth-token="props.authToken" :panel-width="panelWidth" />
    </div>
    <div v-if="props.type === 2">
      <div class="w-full" v-html="data" />
    </div>
    <div v-if="props.type === 3">
      <VueMarkdown :source="data" />
    </div>
    <div v-if="props.type === 4">
      <ImageCustom :image-url="`/api${props.data}`" :auth-token="props.authToken" />
    </div>
    <div v-if="props.type === 99">
      {{ data }}
    </div>
    <NModal
      v-model:show="showSelectNoteModal" :show-icon="false" preset="card" title="笔记" to=".detailContentDiv" :style="{ 'position': 'fixed', 'top': '15vh', 'right': '5vw', 'width': `${0.5 * componentRect.width}px`, 'max-width': '600px', 'z-index': '999' }"
    >
      <NButton size="small" text @click="addNote">
        <NIcon size="20">
          <img src="@/assets/icon_添加@2x.png">
        </NIcon>
        <span> 新笔记</span>
      </NButton>
      <div
        v-for="(item, index) in noteList" :key="index"
        class="noteListItem flex justify-between items-center pl-2.5 pr-2.5 pt-2 pb-2"
        @click="(e) => handleClickNoteItem(e, item)"
      >
        <div class="flex justify-between items-center">
          <img class="icon24 mr-2" src="@/assets/icon_笔记2@2x.png">
          <span v-if="!item.isRenaming">{{ item.name }}</span>
        </div>
      </div>
    </NModal>
    <NModal
      v-model:show="showNoteEditorModal" :show-icon="false" preset="card" to=".detailContentDiv" :style="{ 'position': 'fixed', 'top': '15vh', 'right': '5vw', 'width': `${0.8 * componentRect.width}px`, 'max-width': '600px', 'height': '80vh', 'z-index': '999' }"
    >
      <div
        v-if="noteMode === 'addNote' || noteMode === 'editNote'" class="addNoteContent" style="display: flex;
    flex-direction: column;height: 100%;
    padding-bottom: 8px;"
      >
        <div class="header">
          <div class="flex justify-start items-center" @click="clickNoteReturnButton">
            <img class="icon14" src="@/assets/icon_back@2x.png">
            <span class="title">返回</span>
          </div>
          <div class="saveNote flex justify-start items-center pt-2 pb-2 pl-5 pr-5 mr-2" @click="clickNoteSaveButton">
            <div class="addFolder flex justify-start items-center" style="cursor: pointer;">
              <img class="icon14 mr-2" src="@/assets/icon_保存@2x.png">
              保存
            </div>
          </div>
        </div>
        <NInput
          v-model:value="selectedNoteTitle" class="my-5" placeholder="请输入标题"
          :disabled="noteMode === 'addNote' ? false : true"
        >
          <template #prefix>
            标题：
          </template>
        </NInput>
        <NScrollbar style="height: 60vh">
          <div class="el-tiptap-editor__wrapper">
            <el-tiptap
              v-model:content="noteModel" :extensions="extensions"
              :menu-bubble-options="{ 'keep-in-bounds': true }" width="100%" height="56vh"
            />
          </div>
        </NScrollbar>
      </div>
    </NModal>
    <NDropdown
      placement="bottom-start" trigger="manual" :x="mouseX" :y="mouseY" :options="contextMenuOptions"
      :show="showDropdown" :on-clickoutside="onClickoutsideDropdown" style="z-index: 999" @select="handleDropdownSelect"
    />
  </div>
</template>

<style scoped lang="less">
.detailContentDiv {
  position: relative;
}
.overlay {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99; /* 设置遮罩层的层级 */
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
</style>
