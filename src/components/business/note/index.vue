<script setup lang="ts">
import { computed, defineAsyncComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  NDropdown,
  NIcon,
  NInput,

  useMessage,

} from 'naive-ui'
import 'novel-vue/dist/style.css'
import {
  // necessary extensions
  Doc,
  Text,
  // eslint-disable-next-line sort-imports
  Paragraph,
  // ________________________
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
import { common, createLowlight } from 'lowlight'
import renamePath from '@/assets/icon_重命名@2x.png'
import deleteIconPath from '@/assets/icon_删除@2x.png'
import { postAddNote, postDeleteNote, postEditNote, postNoteList, postUpdateNoteBookName } from '@/api/chat'
import { useUserStore } from '@/store'
const tempNoteNameForRename = ref('')
const resizableRight = ref<any>(null)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)
const Login = defineAsyncComponent(() => import('@/components/common/Login/index.vue'))
const loginModalVisible = ref(false)
const noteList = ref<any>([])
// for asking selected content in the future
const selectedText = ref('')
const selectedTextLength = ref(0)

const handleSelectionChange = () => {
  const selection: any = window.getSelection()
  selectedText.value = selection.toString()
  selectedTextLength.value = selectedText.value.length
}

const options = [

  {
    label: '重命名',
    key: 'rename',
    icon: renderIcon(
      renamePath,
    ),
  },
  {
    label: '删除',
    key: 'delete',
    icon: renderIcon(
      deleteIconPath,
    ),
  },
]
const mode = ref('list')
const selectedNoteTitle = ref('123')
const model = ref('')
const message = useMessage()
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
const resize = (e: { clientX: number }) => {
  if (!isResizing.value)
    return
  const offsetX = startX.value - e.clientX
  const newWidth = startWidth.value + offsetX * 10
  resizableRight.value.style.width = `${newWidth}px`
}
function renderIcon(iconPath: any) {
  return () => {
    return h(NIcon, { class: 'icon' }, [
      h('img', { src: iconPath, alt: 'My Photo' }),
    ])
  }
}
const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResize)
}

const addNote = () => {
  mode.value = 'addNote'
  selectedNoteTitle.value = ''
  model.value = ''
}
const saveNote = () => {
  const tempName = String(selectedNoteTitle.value)
  const tempContent = String(model.value)
  switch (mode.value) {
    case 'addNote':
      postAddNote({
        note_book_name: selectedNoteTitle.value,
        content: model.value,
      }, accessToken.value).then(() => {
        noteList.value.unshift({
          name: selectedNoteTitle.value,
          content: model.value,
          isRenaming: false,
        })
        message.success('保存成功')
      },

      ).catch((err: any) => {
        if (err === 401)
          message.error('401,请重新登录')
        message.error('保存失败')
      })

      break
    case 'editNote':
      postEditNote({
        note_book_name: selectedNoteTitle.value,
        content: model.value,
      }, accessToken.value).then((res: any) => {
        switch (res.data.code) {
          case 200:

            noteList.value = noteList.value.map((ele: any) => ({
              ...ele,
              isRenaming: false,
              content: ele.name === tempName ? tempContent : ele.content,
            }))
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

const clickReturnButton = () => {
  saveNote()
  mode.value = 'list'
  selectedNoteTitle.value = ''
  model.value = ''
}

const handleClickNoteItem = (e: { stopPropagation: () => void; preventDefault: () => void; cancelBubble: boolean }, item: any) => {
  e.stopPropagation()
  e.preventDefault()
  e.cancelBubble = true
  selectedNoteTitle.value = item.name
  mode.value = 'editNote'
  model.value = item.content
}

const handleClickFolderAction = (e: any, index: number) => {
  if (e === 'rename') {
    noteList.value = noteList.value.map((ele: any) => ({
      ...ele,
      isRenaming: false,
    }))
    noteList.value[index].isRenaming = true
  }
  else if (e === 'delete') {
    postDeleteNote(noteList.value[index].name,
      accessToken.value).then((res: any) => {
      switch (res.data.code) {
        case 200:
          noteList.value = noteList.value.filter((ele: any) => ele.name !== noteList.value[index].name)
          break
        case 201:
          message.info('笔记不存在')
          break
        default:
          break
      }
    }).catch((_err: any) => {
      message.error('删除失败')
    })
  }
}

const onBlurHandler = (e: any) => {
  if (tempNoteNameForRename.value !== e.target.value) {
    postUpdateNoteBookName({
      old_name: tempNoteNameForRename.value,
      new_name: e.target.value,
    }, accessToken.value).then((res: any) => {
      switch (res.data.code) {
        case 200:
          noteList.value = noteList.value.map((ele: any) => ({
            ...ele,
            isRenaming: false,
          }))
          break
        case 201:
          message.info('笔记不存在')
          break
        default:
          break
      }
    }).catch((_err: any) => {
      if (_err === 401)
        message.error('401,请重新登录')
      message.error('重命名失败')
      noteList.value = noteList.value.map((ele: any) => ({
        ...ele,
        name: tempNoteNameForRename.value,
        isRenaming: false,
      })).finally(() => {
        tempNoteNameForRename.value = ''
      })
    })
  }
  else {
    noteList.value = noteList.value.map((ele: any) => ({
      ...ele,
      isRenaming: false,
    }))
  }
}

const onFocusHandler = (e: any, index: any) => {
  tempNoteNameForRename.value = noteList.value[index].name
}

const onCLickHandler = (e: any) => {
  e.stopPropagation()
  e.preventDefault()
  e.cancelBubble = true
}

watch(accessToken, (newVal) => {
  if (newVal) {
    postNoteList(accessToken.value).then((res: any) => {
      noteList.value = res.data.data.map((ele: any) => ({
        ...ele,
        isRenaming: false,
      }))
    })
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('mouseup', handleSelectionChange)
})
onMounted(() => {
  window.addEventListener('mouseup', handleSelectionChange)

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
})
</script>

<template>
  <div ref="note">
    <div v-if="mode === 'list'" class="listContent">
      <div class="header">
        <div class="flex items-center">
          <!-- <img class="icon mr-1.5" src="@/assets/icon_笔记@2x.png"> -->
          <span class="title">所有笔记</span>
        </div>
        <div v-if="accessToken" class="createNote flex justify-start items-center">
          <span class="addFolder" style="cursor: pointer;" @click="addNote">+ 创建笔记</span>
        </div>
      </div>
      <div class="seperator mt-4 mb-4" style="width:100%" />
      <div v-if="!accessToken" class="content">
        <div class="text">
          登录之后可以边提问边记录知识点或者登录后可查看已有笔记
        </div>
        <div class="loginButton" @click="loginModalVisible = true">
          登录
        </div>
      </div>
      <div v-if="accessToken" class="LoginContent">
        <div
          v-for="(item, index) in noteList" :key="index"
          class="noteListItem flex justify-between items-center pl-2.5 pr-2.5 pt-2 pb-2"
          @click="(e) => handleClickNoteItem(e, item)"
        >
          <div class="flex justify-between items-center">
            <img class="icon24 mr-2" src="@/assets/icon_笔记2@2x.png">
            <span v-if="!item.isRenaming">{{ item.name }}</span>
            <NInput
              v-if="item.isRenaming" v-model:value="item.name" @blur="(e) => onBlurHandler(e)"
              @click="(e) => onCLickHandler(e)" @focus="(e) => onFocusHandler(e, index)"
            />
          </div>
          <div class="moreButton">
            <NDropdown
              trigger="hover" :options="options" :show-arrow="true"
              @select="(e) => handleClickFolderAction(e, index)"
            >
              <img class="icon24 mr-2" src="@/assets/icon_more@2x.png">
            </NDropdown>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="mode === 'addNote' || mode === 'editNote'" class="addNoteContent" style="display: flex;
    flex-direction: column;height: 100%;
    padding-bottom: 8px;"
    >
      <div class="header">
        <div class="flex justify-start items-center" @click="clickReturnButton">
          <img class="icon14" src="@/assets/icon_back@2x.png">
          <span class="title">返回</span>
        </div>
        <div class="saveNote flex justify-start items-center pt-2 pb-2 pl-5 pr-5" @click="saveNote">
          <div class="addFolder flex justify-start items-center" style="cursor: pointer;">
            <img class="icon14 mr-2" src="@/assets/icon_保存@2x.png">
            保存
          </div>
        </div>
      </div>
      <div class="seperator mt-4 mb-4" style="width:100%" />
      <NInput
        v-model:value="selectedNoteTitle" class="mb-5" placeholder="请输入标题"
        :disabled="mode === 'addNote' ? false : true"
      >
        <template #prefix>
          标题：
        </template>
      </NInput>
      <div class="el-tiptap-editor__wrapper">
        <el-tiptap
          v-model:content="model" :extensions="extensions" :menu-bubble-options="{ 'keep-in-bounds': true }"
          width="100%" height="500px"
        />
      </div>
    </div>
    <Login v-if="loginModalVisible" v-model:visible="loginModalVisible" />
  </div>
</template>

<style scoped lang="less">
.resize-handle {
    width: 8px;
    height: 100%;
    background-color: #20232B;
    position: absolute;
    top: 0;
    left: -4px;
    cursor: col-resize;
  }

  .listContent {
    .header {
      display: flex;
      justify-content: space-between;

      .title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        line-height: 0px;
        margin-left: 10px;
      }

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
</style>
