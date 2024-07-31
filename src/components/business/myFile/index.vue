<script setup lang="ts">
import { computed, defineAsyncComponent, h, onMounted, ref, watch } from 'vue'
import type { MessageReactive } from 'naive-ui'
import {
  NButton, NDropdown, NForm, NFormItem, NIcon, NInput, NModal, NRadio, NSpace,
  NUpload, NUploadDragger, useMessage,
} from 'naive-ui'
import type { FileInfo } from 'naive-ui/es/upload/src/interface'
import { DeleteAddMyKb, DeleteDeleteFileToMyKb, PostAddMyKb, PostUploadFileToMyKb, getfilelistInSelf, postUpdateFileName } from '@/api/chat'
import expandIconPath from '@/assets/icon_展开@2x.png'
import collapseIconPath from '@/assets/icon_收起@2x.png'
import deleteIconPath from '@/assets/icon_删除@2x.png'
import iconFile from '@/assets/icon_文件@2x.png'
import iconFileSelected from '@/assets/icon_文件（选中）@2x.png'
import renamePath from '@/assets/icon_重命名@2x.png'
import { useChatStore, useUserStore } from '@/store'
import { debounce } from '@/utils/functions/debounce'
const renderIcon = (iconPath: any) => {
  return () => {
    return h(NIcon, { class: 'icon' }, [
      h('img', { src: iconPath, alt: 'My Photo' }),
    ])
  }
}
const chatStore = useChatStore()
const myFileList = ref<any>([])
const expandIcon = expandIconPath // Replace with the correct path to the expand icon
const collapseIcon = collapseIconPath // Replace with the correct path to the collapse icon
const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)
const userInfo = computed(() => userStore.userInfo)
const message = useMessage()
const showAddFolderModal = ref(false)
const showAddFileModal = ref(false)
const addFolderNameInModal = ref('')
const folderNameToAddFile = ref('')
const tempFileName = ref('')
const uploadProgress = ref<number | null>(null)
const Login = defineAsyncComponent(() => import('@/components/common/Login/index.vue'))
const loginModalVisible = ref(false)
const models = ref<any[] | any>([])
const filteredModels = computed(() => models.value.filter((e: any) => e !== ''))
const selectedModel = ref<any>(models.value[0] || '')
const options = [

  {
    label: '新增文档',
    key: 'add',
    icon: renderIcon(
      iconFile,
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

const fileOptions = [
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

const onInputBoxRenameBlurHandler = (e: any, index: number, childIndex: number) => {
  myFileList.value[index].children[childIndex].isRenaming = false
  postUpdateFileName({
    kb_name: myFileList.value[index].kb_name,
    old_filename: tempFileName.value,
    new_filename: myFileList.value[index].children[childIndex].name,
  }, accessToken.value).then((res) => {
    switch (res.data.code) {
      case 200:
        message.info(
          '文件名更新成功',
          { duration: 5000 },
        )
        break
      case 201:
        myFileList.value[index].children[childIndex].name = tempFileName.value
        message.info(
          '文件名更新失败',
          { duration: 5000 },
        )
        break
      case 401:
        message.info(
          'Token过期，请重新登录',
          { duration: 5000 },
        )
        userStore.setAccessToken('')
        break
      default:
        break
    }
  }).finally(() => {
    tempFileName.value = ''
  })
}

const updateFileName = (e: any, index: number, childIndex: number) => {
  myFileList.value[index].children[childIndex].name = e
}

const clickMyFileFolder = (index: number) => {
  if (chatStore.isChatLoading)
    return
  chatStore.setChatMode(2)
  myFileList.value = myFileList.value
    .map((ele: any, i: number) => ({
      ...ele,
      selected: false,
      children: ele.children.map((child: any) => ({
        ...child,
        // isSelected: index === i ? child.isSelected : false,
        isSelected: index === i ? child.isSelected : true,
      })),
    })).map((ele: any, i: number) => ({
      ...ele,
      selected: i === index,
      isExpanded: i === index ? !ele.isExpanded : false,
    }))
}
const debounceClickMyFileFolder = debounce(clickMyFileFolder, 500)
const handleGetFileListInSelf = async (isInitialCalling = false) => {
  getfilelistInSelf(accessToken.value).then((res) => {
    switch (res.data.code) {
      case 200:
        myFileList.value = res.data.data.map((ele: any) => ({
          kb_name: ele.kb_name,
          selected: false,
          isExpanded: false,
          children: ele.file_list.map((ele: any) => ({
            name: ele,
            isRenaming: false,
            isSelected: true,
          })),
        }))

        break
      default:
        break
    }
  }).catch((err) => {
    if (err === 401) {
      !isInitialCalling && message.error('401,请重新登录')
      userStore.setAccessToken('')
    }
    else { message.error(`get file list fail: ${err?.msg} `) }
  })
}

const handleClickFolderAction = (key: string, index: any) => {
  switch (key) {
    case 'add':
      showAddFileModal.value = true
      folderNameToAddFile.value = myFileList.value[index].kb_name
      break
    case 'delete':
      DeleteAddMyKb(myFileList.value[index].kb_name, accessToken.value).then((res) => {
        switch (res.data.code) {
          case 200:
            message.info(
              '知识库文件夹删除成功',
              { duration: 5000 },
            )
            myFileList.value = myFileList.value.filter((ele: any) => ele.kb_name !== myFileList.value[index].kb_name)
            myFileList.value = myFileList.value
              .map((ele: any, i: number) => ({
                ...ele,
                selected: i === 0,
                isExpanded: i === 0,
                children: ele.children.map((child: any) => ({
                  ...child,
                  selected: i === 0,
                })),
              }))
            break
          case 401:
            message.info(
              'Token过期，请重新登录',
              { duration: 5000 },
            )
            userStore.setAccessToken('')
            break
          default:
            break
        }
      })
      break
    default:
      break
  }
}

const handleClickFileAction = (key: string, index: any, childIndex: any) => {
  switch (key) {
    case 'rename':
      // myFileList.children.isRenaming should be all false first
      tempFileName.value = myFileList.value[index].children[childIndex].name
      myFileList.value.forEach((ele: any) => {
        ele.children.forEach((child: any) => {
          child.isRenaming = false
        })
      })
      myFileList.value[index].children[childIndex].isRenaming = true
      break
    case 'delete':
      DeleteDeleteFileToMyKb(
        {
          file_name: myFileList.value[index].children[childIndex].name,
          kb_name: myFileList.value[index].kb_name,
        }, accessToken.value || '').then((res) => {
        switch (res.data.code) {
          case 200:
            message.success(res.data.msg)
            myFileList.value.forEach((ele: any) => {
              if (ele.kb_name === myFileList.value[index].kb_name)
                ele.children = ele.children.filter((f: any) => f.name !== myFileList.value[index].children[childIndex].name)
            })
            break
          case 500:
            message.error(`upload fail: ${res.msg} `)
            break
          default:
            message.error(`upload fail: ${res.msg} `)
            break
        }
      }).catch((err) => {
        message.error(`upload fail: ${err?.msg} `)
      })
      break
    default:
      break
  }
}

const addFolder = () => {
  if (accessToken.value === '') {
    message.info(
      '请先登录',
      { duration: 5000 },
    )
    loginModalVisible.value = true
    return
  }
  showAddFolderModal.value = true
}

const clickFile = (e: any, index: number, childIndex: number) => {
  chatStore.setChatMode(2)
  myFileList.value[index].children[childIndex].isSelected = !myFileList.value[index].children[childIndex].isSelected
  // all folder and file should be diselected except current folder and file
  myFileList.value = myFileList.value.map((ele: any, i: number) => ({
    ...ele,
    selected: index === i,
    children: ele.children.map((child: any) => ({
      ...child,
      isSelected: index === i ? child.isSelected : true,
    })),
  }))
}

const debounceClickFile = debounce(clickFile, 1000)
const clickConfirmButtonInAddFolderModal = () => {
  const temp = addFolderNameInModal.value
  showAddFolderModal.value = false
  // send request to add folder
  PostAddMyKb(addFolderNameInModal.value, accessToken.value).then(async (res) => {
    switch (res.data.code) {
      case 200:
        message.info(
          '知识库文件夹添加成功',
          { duration: 5000 },
        )
        folderNameToAddFile.value = temp
        myFileList.value.unshift({
          kb_name: temp,
          selected: false,
          isExpanded: false,
          children: [],
        })
        showAddFileModal.value = true
        break
      case 201:
        message.error(`upload fail: ${res.data.msg} `)
        break
      case 401:
        message.info(
          'Token过期，请重新登录',
          { duration: 5000 },
        )
        userStore.setAccessToken('')
        break
      default:
        break
    }
  })
}

const customRequest = async (options: { file: FileInfo }, kb: string | Blob) => {
  showAddFileModal.value = false
  const { file } = options
  const formData = new FormData()
  formData.append('file', file.file as File)
  formData.append('kb_name', kb)

  const suffix = file.name.substring(file.name.lastIndexOf('.') + 1)

  if (suffix === 'csv') {
    message.error('不支持 csv 文件')
    return
  }

  const msgReactive: MessageReactive = message.create(`${file.name}已上传0%`, {
    duration: 10000,
    showIcon: false,

  })
  await PostUploadFileToMyKb(formData, accessToken.value || '', (progressEvent) => {
    msgReactive.content = `${file.name} 已上传 ${Math.round((progressEvent.loaded * 100) / progressEvent.total) >= 99 ? 99 : Math.round((progressEvent.loaded * 100) / progressEvent.total)}%`
  }).then((res) => {
    switch (res.data.code) {
      case 200:
        message.success(`${file.name}  已上传成功`)
        // push file name to current folder which is the children of myFileList
        myFileList.value.forEach((ele: any) => {
          if (ele.kb_name === kb) {
            ele.children.unshift({
              name: file.name,
              isRenaming: false,
              isSelected: true,
            })
          }
        })
        break
      case 201:
      case 500:
        message.error(`${file.name}上传失败，原因: ${res.data.msg}`)
        break
      default:
        break
    }
  }).catch((err) => {
    message.error(`${file.name}上传失败，原因: ${err?.msg}`)
  }).finally(() => {
    uploadProgress.value = null
  })
}
const handleChangeModel = (e: any) => {
  selectedModel.value = e.target.value
}

// use watch method accessToken to do request getfilelistInSelf if accessToken changed and is not empty
watch(accessToken, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal)
    handleGetFileListInSelf()
})

watch(showAddFolderModal, () => {
  addFolderNameInModal.value = ''
})

watch(() => chatStore.chatMode, (newVal) => {
  if (newVal !== 2) {
    myFileList.value = myFileList.value.map((ele: any) => ({
      ...ele,
      selected: false,
      isExpanded: false,
      children: ele.children.map((child: any) => ({
        ...child,
        isSelected: true,
      })),
    }))
  }
}, { deep: true })

watch(myFileList, (newVal) => {
  chatStore.setMyFileList(newVal.map((ele: any) => ({
    ...ele,
    childrenString: ele.children.map((child: any) => child.name).join(','),
  })) as any)
}, { deep: true })

watch(userInfo, (newVal) => {
  if (newVal)
    models.value = newVal.models
}, { deep: true })

watch(() => models.value, (newVal) => {
  if (newVal)
    selectedModel.value = newVal[0]
}, { deep: true })

watch(() => selectedModel.value, (newVal) => {
  if (newVal)
    chatStore.setSelectedModel(newVal)
}, { deep: true })

onMounted(async () => {
  accessToken.value && handleGetFileListInSelf(true)
})
</script>

<template>
  <div>
    <div class="flex justify-between flex-wrap">
      <div class="flex justify-start mb-1.5">
        <img class="icon mr-1.5 " src="@/assets/icon_我的文档@2x.png">
        <span class="title">我的文档</span>
      </div>
      <div class="flex justify-start items-center buttonWrapper" style="cursor: pointer;">
        <img class="addIcon " src="@/assets/icon_添加@2x.png">
        <span class="addFolder" @click="addFolder">添加文档</span>
      </div>
    </div>
    <div class="seperator mt-4 mb-4" />
    <div v-if="accessToken">
      <ul>
        <li v-for="(item, index) in myFileList" :key="item.kb_name + index">
          <div
            class="mb-1" style="display: flex;justify-content: space-between;align-items: center;
                    " :class="{ selectedKnowledge: item.selected, defaultKnowledge: !item.selected }"
            @click="debounceClickMyFileFolder(index)"
          >
            <div
              style="display: flex;
    justify-content: flex-start;
    align-items: center;"
            >
              <img class="arrowIcon" :src="item.isExpanded ? expandIcon : collapseIcon">
              <span :title="item.kb_name" class="ml-1">{{ item.kb_name }}</span>
            </div>
            <div>
              <NDropdown
                trigger="hover" :options="options" :show-arrow="true"
                @select="(e) => handleClickFolderAction(e, index)"
              >
                <img class="addIcon " src="@/assets/icon_more@2x.png">
              </NDropdown>
            </div>
          </div>
          <div v-if="item.isExpanded" class="mb-2" style="width: 266px;">
            <NSpace
              v-for="(child, childIndex) in item.children" :key="childIndex" class="flex"
              style="flex-direction: column !important;"
            >
              <div
                class="pl-6 mb-1 pr-2.5 h-8"
                :class="{ fileSelected: child.isSelected, fileDefault: !child.isSelected }" :checked="child.checked"
                :value="child.name" name="basic-demo" style="display:flex;justify-content:space-between;
                                align-self: center;
                                " @click="(e) => clickFile(e, index, childIndex)"
              >
                <div
                  style="display: flex;
    justify-content: flex-start;
    align-items: center;"
                >
                  <img
                    class="Icon24Px" :class="{ iconSelected: child.isSelected }"
                    :src="child.isSelected ? iconFileSelected : iconFile"
                  >
                  <span
                    v-if="!child.isRenaming" :title="child.name" style="overflow: hidden;
                    text-wrap: nowrap;
                                   webkit-text-wrap: nowrap;
                                   white-space: nowrap;
                                   max-width: 150px;
                                   text-overflow: ellipsis;
                                    " class="ml-1"
                  >{{ child.name }}</span>
                  <NInput
                    v-if="child.isRenaming" v-model:value="child.name"
                    :on-update:value="(e: any) => updateFileName(e, index, childIndex)" class="ml-1"
                    @blur="(e) => onInputBoxRenameBlurHandler(e, index, childIndex)"
                  />
                </div>
                <div>
                  <NDropdown
                    trigger="hover" :options="fileOptions" :show-arrow="true"
                    @select="(key) => handleClickFileAction(key, index, childIndex)"
                  >
                    <img class="addIcon " src="@/assets/icon_more@2x.png">
                  </NDropdown>
                </div>
              </div>
            </NSpace>
          </div>
        </li>
      </ul>
      <NSpace v-if="filteredModels.length" style="display: flex; flex-direction: column;">
        <div class="mb-1">
          模型选择
        </div>
        <div>
          <NRadio
            v-for="model in filteredModels" :key="model" :value="model" :disabled="false"
            :checked="model === selectedModel" name="model" class="mb-1" @change="handleChangeModel"
          >
            {{ model }}
          </NRadio>
        </div>
      </NSpace>
    </div>
    <NModal
      v-model:show="showAddFolderModal" :show-icon="false" preset="card" title="添加文档"
      style="width: 50%; max-width: 600px"
    >
      <div>
        <NForm ref="loginForm">
          <NFormItem label="文档名" prop="username">
            <NInput v-model:value="addFolderNameInModal" placeholder="起个文档名吧" />
          </NFormItem>
        </NForm>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <NButton type="success" color="#506BFF" text-color="#FFFFFF" @click="clickConfirmButtonInAddFolderModal">
            确认
          </NButton>
        </div>
      </template>
    </NModal>
    <Login v-if="loginModalVisible" v-model:visible="loginModalVisible" />
    <NModal
      v-model:show="showAddFileModal" :show-icon="false" preset="card" :title="`上传文件到文件夹(${folderNameToAddFile})`"
      style="width: 50%; max-width: 600px"
    >
      <div
        class="flex justify-center flex-col items-center pl-7 pr-7"
        style="width: 100%;height: 223px;background: #2E313C;border-radius: 10px 10px 10px 10px;opacity: 1;"
      >
        <img
          class="mb-2" style="width: 90px;
height: 90px;
border-radius: 0px 0px 0px 0px;
opacity: 1;" src="@/assets/icon@2x.png"
        >
        <NUpload
          directory-dnd multiple class="mb-2 flex justify-center" action="/api//my_kb/upload_file"
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.png" :disabled="false" :headers="{
            auth: accessToken,
          }" :show-file-list="false" :custom-request="(options) => customRequest(options, folderNameToAddFile)"
        >
          <NUploadDragger>
            <NButton class="mb-2" style="width: 140px;height: 50px;border-radius: 10px;">
              上传文件
            </NButton>
          </NUploadDragger>
        </NUpload>
        <div
          class="mt-2" style="font-size: 12px;
font-weight: 400;
color: rgba(255,255,255,0.5);
"
        >
          目前支持:md,txt,docx,pdf；一个知识库下最多支持10个文件，每个文件大小不超过20M
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped lang="less">
.Icon24Px {
  width: 24px;
  height: 24px;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}

.addIcon {
  width: 14px;
  height: 14px;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  display: inline;

}

.addFolder {
  font-size: 14px;
  font-weight: bold;
  color: #607FFF;
  line-height: 0px;
  display: flex;
  align-items: center;
}

.n-button--success-type {
  width: 100px !important;
}

.iconSelected {
  color: #607FFF;
}

.fileSelected {
  border-radius: 10px 10px 10px 10px;
  opacity: 1;
  color: #607FFF;
}

.fileSelected:hover {
  background: #2E313C;
  opacity: 1;
}

.fileDefault {
  border-radius: 10px 10px 10px 10px;
  opacity: 70%;
}

.fileDefault:hover {
  background: #2E313C;
  opacity: 1;
}

.buttonWrapper {
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

.buttonWrapper:hover {
  background: rgba(96, 127, 255, 0.2);
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid #607FFF;
  color: #607FFF;
}
</style>
