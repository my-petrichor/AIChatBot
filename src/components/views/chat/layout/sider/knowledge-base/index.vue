<script setup lang='ts'>
import { NButton, NCheckbox, NDatePicker, NForm, NFormItem, NInput, NPopconfirm, NRadio, NRadioGroup, NSelect, NSpace, NTabPane, NTabs, NTag, NUpload, useMessage } from 'naive-ui'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { SvgIcon } from '@/components/common'
import { DeleteAddMyKb, DeleteDeleteFileToMyKb, PostAddMyKb, PostUploadFileToMyKb, getUserProfile, getfilelist, getfilelistInSelf } from '@/api/chat'
import { idStore } from '@/store/modules/knowledgebaseid'
import './index.less'
import { useChatStore, useUserStore } from '@/store'
const Login = defineAsyncComponent(() => import('@/components/common/Login/index.vue'))
const items = ref<any>([])
const itemsInSelf = ref<any>([])
const store = idStore()
const chatStore = useChatStore()
const message = useMessage()
const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)
const tabsRef = ref('general')
const filterConditions = [
  {
    label: '按照时间维度筛选',
    value: 'time',
  },
]

const loginModalVisible = ref(false)
const ms = useMessage()

const formValue = ref({
  user: {
    name: '',
  },
})
const rules = {
  user: {
    name: {
      required: true,
      message: '请输入名称',
      trigger: 'blur',
    },
  },
}

const modelValue = computed(() => chatStore.modelInKB)

// const models = [
//   {
//     value: "ChatGLM-6b",
//     label: "ChatGLM-6b"
//   },
//   {
//     value: 'gpt-3.5-turbo',
//     label: 'gpt-3.5-turbo'
//   }
// ]

const models = computed(() => {
  return userStore.models.map((ele) => {
    return {
      value: ele,
      label: ele,
    }
  })
})
const showModels = computed(() => {
  return userStore.models.length > 0
})

onMounted(async () => {
  const res = await getfilelist({})
  res?.data?.data?.forEach((item: any) => {
    items.value.push({
      value: item,
      show: false,
      checked: store.knowledgeid.map(ele => ele.id).includes(item),
      // checked:true,
      filter: store.knowledgeid?.find(ele => ele.id === item)?.filter ?? 'time',
      timeRange: store.knowledgeid?.find(ele => ele.id === item)?.timeRange ?? ref<[number, number]>([new Date(new Date().getFullYear() - 3, new Date().getMonth(), new Date().getDate()).getTime(), Date.now()]),
    })
  })
  const usersProfile = accessToken.value ? await getUserProfile(accessToken?.value || '') : ''
  userStore.setModels(usersProfile ? usersProfile?.data?.data?.models : [])
  chatStore.setModelInKB(usersProfile ? usersProfile?.data?.data?.models[0] : '')
})

const handleValidateClick = (item: any) => {
  items.value.forEach((res: { value: any; show: boolean }) => {
    if (res.value === item)
      res.show = !res.show
  },
  )
}

const handleCheckboxUpdate = (checked: boolean, value: any) => {
  // below might need refactor
  if (!checked) {
    // store.knowledgeid = store.knowledgeid.filter((item: any) => item.id !== value);
    // store.recordState()
    store.setKnowledgeid(store.knowledgeid.filter((item: any) => item.id !== value))
  }
  else {
    store.knowledgeid.push(
      {
        id: value,
        filter: items.value.find((ele: { value: any }) => ele.value === value).filter,
        timeRange: items.value.find((ele: { value: any }) => ele.value === value).timeRange,
      },
    )
    store.recordState()
  }
  items.value.forEach((res: { value: any; checked: boolean }) => {
    if (res.value === value)
      res.checked = !res.checked
  })
}

const handleCheckboxUpdateInSelf = (checked: boolean, value: any) => {
  // below might need refactor this is to put current selected kb to knowledge store so can send to chat
  if (!checked) {
    // store.knowledgeidInself = store.knowledgeidInself.filter((item: any) => item.id !== value);
    // store.recordState()
    store.setKnowledgeidInself(store.knowledgeidInself.filter((item: any) => item.id !== value))
  }
  else {
    store.knowledgeidInself.push(
      {
        id: value,
      },
    )
    store.recordState()
  }
  itemsInSelf.value.forEach((res: { value: any; checked: boolean }) => {
    if (res.value === value)
      res.checked = !res.checked
  })
}

const clickButtonInSelf = (value: any) => {
  itemsInSelf.value.forEach((res: { value: any; show: boolean }) => {
    if (res.value === value)
      res.show = !res.show
  })
}

const handleClose = (value: any) => {
  items.value.forEach((res: { value: any; checked: boolean }) => {
    if (res.value === value)
      res.checked = false
  })
}

const handleCloseInSelf = (value: any) => {
  itemsInSelf.value.forEach((res: { value: any; checked: boolean }) => {
    if (res.value === value)
      res.checked = false
  })
}

const finishUploadInSelf = (file: any) => {
  // itemsInSelf.value.push({
  //   value: file.file.name,
  //   show: true,
  //   checked: true,
  // })
}

const onChangeUploadInSelf = (options: any) => {
//
}

const clickTab = (value: string) => {
  tabsRef.value = value
  switch (value) {
    case 'general':
      chatStore.setTypeInKbChat(1)
      break
    case 'self':
      chatStore.setTypeInKbChat(2)
      break
    default:
      break
  }
  if (value === 'self' && !accessToken.value) {
    loginModalVisible.value = true
    // open login modal
    message.success('如需使用自建知识库功能，请先登录')
  }
}
const isLogin = computed(() => userStore.isLogin)


const addMyKbName = () => {
  if (formValue.value.user.name.trim() !== '') {
    PostAddMyKb(formValue.value.user.name.trim(), accessToken?.value || '').then((res) => {
      switch (res.data.code) {
        case 200:
          itemsInSelf.value.push({
            value: formValue.value.user.name.trim(),
            show: false,
            checked: true,

          })
          break
        default:
          ms.error(res.data.msg)
          break
      }
    })
  }
}
async function handleDeleteMyKb(item: any) {
  const res = await DeleteAddMyKb(item.value, accessToken?.value || '')
  switch (res.data.code) {
    case 200:
      const res = await getfilelistInSelf(accessToken?.value || '')
      itemsInSelf.value = []
      res.data.data.forEach((item: any) => {
        itemsInSelf.value.push({
          value: item.kb_name,
          file_list: item.file_list,
          show: false,
          checked: true,
        })
      })
      break
    default:
      ms.error(res.data.msg)
      break
  }
}

async function handleDeleteFileInMyKb(selfKb: any, fileName: string) {
  DeleteDeleteFileToMyKb(
    {
      file_name: fileName,
      kb_name: selfKb.value,
    }, accessToken.value || '').then((res) => {
    switch (res.data.code) {
      case 200:
        message.success(res.data.msg)
        itemsInSelf.value.forEach((ele: { value: string | Blob; file_list: any }) => {
          if (ele.value === selfKb.value)
            ele.file_list = ele.file_list.filter((f: string) => f !== fileName)
        })
        break
      case 500:
        message.error(`upload fail: ${res.msg} `)
        break
      default:
        break
    }
  }).catch((err) => {
    message.error(err.msg)
  })
}
const customRequest = (options: { file: any }, kb: string | Blob) => {
  const { file } = options
  const formData = new FormData()
  formData.append('file', file.file as File)
  formData.append('kb_name', kb)
  message.loading(`uploading file ${file.name}`)
  PostUploadFileToMyKb(
    formData, accessToken.value || '').then((res) => {
    switch (res.data.code) {
      case 200:
        message.success('upload successfully')
        itemsInSelf.value.forEach((ele: { value: string | Blob; file_list: any }) => {
          if (ele.value === kb) {
            // ele.file_list = res.data.data[0].file_list
            ele.file_list.push(file.name)
          }
        })
        break
      case 201:
      case 500:
        message.error(`upload ${file.name} fail : ${res.data.msg}`)
        break
      default:
        break
    }
  }).catch((err) => {
    message.error(err.msg)
  })
}
const changeModel = (value: string) => {
  chatStore.setModelInKB(value)
}

watch(accessToken, async (newValue) => {
  const resInself = accessToken.value ? await getfilelistInSelf(accessToken?.value || '') : []
  itemsInSelf.value = []
  resInself?.data?.data?.forEach((item: any) => {
    itemsInSelf.value.push({
      value: item.kb_name,
      file_list: item.file_list,
      show: false,
      checked: false,
      // checked: store.knowledgeidInself.map(ele => ele.id).includes(item),
    })
  })

  const usersProfile = accessToken.value ? await getUserProfile(accessToken?.value || '') : ''
  userStore.setModels(usersProfile ? usersProfile?.data?.data?.models : [])
  chatStore.setModelInKB(usersProfile ? usersProfile?.data?.data?.models[0] : '')
},
)

watch(items, (newItems, oldItems) => {
  store.setKnowledgeid(newItems.filter((ele: { checked: any }) => ele.checked).map((ele: { value: any; filter: any; timeRange: any }) => ({
    id: ele.value,
    filter: ele.filter,
    timeRange: ele.timeRange,
  })))
}, { deep: true })

watch(itemsInSelf, (newItems, oldItems) => {
  store.setKnowledgeidInself(newItems.filter((ele: { checked: any }) => ele.checked).map((ele: { value: any; filter: any; timeRange: any }) => ({
    id: ele.value,
    filter: ele.filter,
    timeRange: ele.timeRange,
  })))
}, { deep: true })
})
</script>

<template>
  <NTabs :ref="tabsRef" type="line" animated :on-update:value="clickTab">
    <NTabPane name="general" tab="通用知识库">
      <NSpace
        vertical class="mb-2 min-w-full min-h-full h-24"
        style="border: 1px dotted grey; padding: 2px; height:100%;min-height:100px"
      >
        <div v-for="item in items" :key="item.value" style="width:80%">
          <NTag v-if="item.checked" size="small" closable style="width:100%" @close="handleClose(item.value)">
            {{
              item.value
            }}
          </NTag>
        </div>
      </NSpace>
      <NCheckboxGroup>
        <div v-for="item in items" :key="item.value">
          <div class="flex items-center">
            <NCheckbox :checked="item.checked" @update:checked="handleCheckboxUpdate($event, item.value)" />
            <NButton
              :style="[{ 'overflow': 'hidden', 'margin-left': '5px' }]" block size="large" style="width:80%"
              @click="handleValidateClick(item.value)"
            >
              {{ item.value }}
            </NButton>
          </div>
          <div v-if="item.show" class="p-2 flex-1 min-h-0 pb-4 overflow-hidden">
            <NSelect v-model:value="item.filter" class="mb-2" :options="filterConditions" />
            <NDatePicker v-model:value="item.timeRange" class="mb-2" type="yearrange" clearable />
          </div>
          <br>
        </div>
      </NCheckboxGroup>
    </NTabPane>
    <NTabPane name="self" tab="自建知识库">
      <div v-if="isLogin">
        <NSpace
          class="mb-2 min-w-full min-h-full h-24"
          style="border: 1px dotted grey; padding: 2px;height:100%; min-height:100px" vertical
        >
          <div v-for="item in itemsInSelf" :key="item.value" style="width:80%">
            <NTag v-if="item.checked" closable style="width:100%;min-with:30px" @close="handleCloseInSelf(item.value)">
              {{
                item.value
              }}
            </NTag>
          </div>
        </NSpace>
        <NForm ref="formRef" inline :model="formValue" :rules="rules">
          <NFormItem style="width: 60% !important;" label="" path="user.name">
            <NInput v-model:value="formValue.user.name" placeholder="起个知识库名吧！" />
          </NFormItem>
          <NFormItem style="width: 20% !important;">
            <NButton attr-type="button" @click="addMyKbName">
              新增
            </NButton>
          </NFormItem>
        </NForm>
        <NCheckboxGroup>
          <div v-for="item in itemsInSelf" :key="item.value">
            <div class="flex items-center">
              <NCheckbox
                class="mr-1" :checked="item.checked"
                @update:checked="handleCheckboxUpdateInSelf($event, item.value)"
              />
              <NButton block size="large" style="width:80%;" @click="clickButtonInSelf(item.value)">
                {{ item.value }}
              </NButton>
              <div class="absolute z-10 flex visible right-1">
                <template v-if="item.isEdit" />
                <template v-else>
                  <NPopconfirm placement="bottom" @positive-click="handleDeleteMyKb(item)">
                    <template #trigger>
                      <button class="p-1">
                        <SvgIcon icon="ri:delete-bin-line" />
                      </button>
                    </template>
                    确定删除此文件？
                  </NPopconfirm>
                </template>
              </div>
            </div>

            <div v-if="item.show" class="p-2 flex-1 min-h-0 pb-4 overflow-hidden">
              <filelist v-if="item.value" :knowledgebaseid="item.value" />
              <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
                <!-- <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" /> -->
                <NUpload
                  v-model:file-list="item.fileList" multiple class="mb-2 flex justify-center"
                  action="/api//my_kb/upload_file" accept=".pdf,.doc,.docx,.txt,.md,.jpg,.png" :disabled="false" :on-finish="finishUploadInSelf" :headers="{
                    auth: accessToken,
                  }" :show-file-list="false"
                  :custom-request="(options: any) => customRequest(options, item.value)"
                  :on-change="onChangeUploadInSelf"
                >
                  <NButton style="font-size: 16px">
                    上传文件
                  </NButton>
                </NUpload>
                <div>
                  <div v-for="item2 in item.file_list" :key="item2">
                    <div>
                      {{ item2 }}
                      <NPopconfirm placement="bottom" @positive-click="handleDeleteFileInMyKb(item, item2)">
                        <template #trigger>
                          <button class="p-1">
                            <SvgIcon icon="ri:delete-bin-line" />
                          </button>
                        </template>
                        确定删除此文件？
                      </NPopconfirm>
                    </div>
                    <br>
                  </div>
                </div>
              </div>
            </div>
            <br>
          </div>
        </NCheckboxGroup>
      </div>
    </NTabPane>
  </NTabs>
  <template v-if="showModels">
    <NSpace class="mb-1">
      LLM Model:
    </NSpace>
    <NRadioGroup v-model:value="modelValue" name="radiogroup" :on-update:value="changeModel">
      <NSpace>
        <NRadio v-for="song in models" :key="song.value" :value="song.value">
          {{ song.label }}
        </NRadio>
      </NSpace>
    </NRadioGroup>
  </template>
  <Login v-if="loginModalVisible" v-model:visible="loginModalVisible" />
</template>
