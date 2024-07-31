<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import _ from 'lodash'
import { useRoute } from 'vue-router'
import { NButton, NInput, useDialog, useMessage } from 'naive-ui'
// import html2canvas from 'html2canvas'
import RecordRTC from 'recordrtc'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useUsingContext } from './hooks/useUsingContext'
// import speechOff from '@/assets/silentVoiceInput.png'
// import speechOn from 
import new_conversation from '@/assets/new_conversation.png'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { t } from '@/locales'
import { PostGenerateAbstractInMyKb, PostQueryMerge, chat, chatMyKbStream, chatPublicRepoStream, postConversationRecord, postGenerateGeneralQuery } from '@/api/chat'
import { kb_EN_CN_convertion, mapCurrentChatModeToType } from '@/consts/const'
import { router } from '@/router'

let controller = new AbortController()

const route = useRoute()
const dialog = useDialog()
const chatStore = useChatStore()
const userStore = useUserStore()
const history = ref<any>([])
const stopCtrl = ref<any>()
const accessToken = computed(() => userStore.accessToken)

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext } = useUsingContext()
const uuid = ref<any>(route.params.uuid)

let speechWS: WebSocket | null = null
let recorder: RecordRTC | null = null

const dataSources = computed(() => accessToken.value ? chatStore.getChatByUuid(uuid.value) : [])
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))
const quoteStr = ref<string>('')
const prompt = ref<string>('')
const loading = ref<boolean>(false)
const speeching = ref<boolean>(false)
const recognizing = ref<boolean>(false)
// 语音识别超时 默认30秒
let recognizerTimer: any
const queryContent = ref<any>('')
const onRegenerateing = ref<boolean>(false)
const inputRef = ref<HTMLElement>()
const appStore = useAppStore()
const messageFunction = useMessage()
const currentChatMode = ref(chatStore.chatMode)
const currentThemeName = ref(appStore.theme)
const showAnnoucement = ref(true)
const currentFolder = ref('')
const currentSelectedFiles = ref(chatStore.myFileList.filter(ele => ele.selected)[0]?.children?.filter((ele: { isSelected: any }) => ele.isSelected)?.map((ele: { name: any }) => ele.name) || [])
const announcementContent = ref(`已加载${kb_EN_CN_convertion[currentFolder.value] || currentFolder.value}，可以对此进行对话提问`)
const placeholder = computed(() => {
  return '请输入提问内容，按回车键提交'
})
dataSources.value.forEach((item, index) => {
  if (item?.loading)
    updateChatSome(uuid, index, { loading: false })
})

async function handleSubmit() {
  // unable to submit if voice recognition is in progress
  if (recognizing.value || speeching.value)
    return
  onConversation()
}

async function handleSpeech() {
  if (speeching.value) {
    speeching.value = false
    recognizing.value = true
    recorder.stopRecording(stopRecordingCallback)
  }
  else if(!speeching.value && !recognizing.value) {
    speeching.value = true
    if (speechWS == null || speechWS.readyState === speechWS.CLOSED) {
      speechWS = null
      speechWS = new WebSocket('ws://120.48.109.89:7861/speech/recognize')
      setWebSocket(speechWS)
    }

    // 开始录音
    captureMicrophone((microphone: any) => {
      recorder = new RecordRTC(microphone, {
        type: 'audio',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
      })

      recorder.startRecording()

      // 点击停止说话，释放麦克风
      recorder.microphone = microphone
    })
  }
}

function setWebSocket(ws: any) {
  ws.onopen = () => {
    console.log('Connection to server opened')
  }
  // 将识别结果传送给前端显示
  ws.onmessage = (e: any) => {
    console.log('onmessage', e.data)
    const data = JSON.parse(e.data)
    console.log(data)
    recognizing.value = false
    if (data.result !== '')
      prompt.value = prompt.value + data.result
    // onConversation()
  }
  ws.onclose = () => {
    console.log('Connection to server closed')
    ws = null
  }
  ws.onerror = () => {
    console.log('Connection to server error')
    ws = null
  }
}

function captureMicrophone(callback: any) {
  navigator.mediaDevices.getUserMedia({
    audio: true,
  }).then(callback).catch((error) => {
    // TODO: 添加错误弹窗
    console.error(error)
  })
}

function stopRecordingCallback() {
  const blob = recorder.getBlob()
  console.log(blob)
  // 麦克风停止使用
  recorder.microphone.stop()
  // 传输blob
  try {
    if (speechWS == null || speechWS?.readyState === speechWS?.CLOSED) {
      speechWS = null
      speechWS = new WebSocket('ws://120.48.109.89:7861/speech/recognize')
      setWebSocket(speechWS)
      speechWS?.send(blob)
    }
    else {
      speechWS?.send(blob)
    }
  }
  catch (error) {
    console.log('speechWS.send error: %v', error)
    speechWS?.close()
    speechWS = null
		recognizing.value = false
		messageFunction.error('语音识别失败')
  }
}

const handleKeyDown = async (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

const postChatMyKbStream = async (params: any, message: string, chatIdx: number, options?: Chat.ConversationRequest) => {
  // 清理引用 quote
  clearQuote()
  loading.value = true

  let lastText = ''
  try {
    // await getting query result
    await PostQueryMerge(params.question, userStore.accessToken).then((res) => {
      queryContent.value = res.data.data
      chatMyKbStream(
        { ...params, question: queryContent.value },
        userStore.accessToken,
        () => {
        },
        (data) => {
          if (!stopCtrl.value.get(chatIdx)) {
            lastText = lastText + data.answer
            updateChat(
              uuid.value,
              chatIdx,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText,
                inversion: false,
                error: false,
                loading: false,
                conversationOptions: null,
                requestOptions: { prompt: message, options: { ...options } },
              },
            )
            scrollToBottomIfAtBottom()
          }
        },
        (error) => {
          messageFunction.error(error)
          if (!stopCtrl.value.get(chatIdx)) {
            loading.value = false
            onRegenerateing.value = false
            updateChatSome(uuid.value, chatIdx, { loading: false })
            chatStore.setIsChatLoading(false)
          }
          else {
            stopCtrl.value.delete(chatIdx)
          }
        },
        () => {
          queryContent.value = ''
          if (!stopCtrl.value.get(chatIdx)) {
            loading.value = false
            onRegenerateing.value = false
            updateChatSome(uuid.value, chatIdx, { loading: false })
            chatStore.setIsChatLoading(false)
          }
          else {
            stopCtrl.value.delete(chatIdx)
          }
        },
      )
    }).catch((_err) => {
    }).finally(() => {
    })
  }
  catch (error) {
  }
}

const postChatPublicRepoStream = async (params: any, message: string, chatIdx: number, options?: Chat.ConversationRequest) => {
  loading.value = true
  let lastText = ''
  try {
    // await getting query result
    await PostQueryMerge(params.question, userStore.accessToken).then((res) => {
      queryContent.value = res.data.data
      chatPublicRepoStream(
        {
          ...params,
          question: queryContent.value,
        },
        userStore.accessToken,
        () => {
        },
        (data) => {
          if (!stopCtrl.value.get(chatIdx)) {
            lastText = lastText + data.answer
            const result = lastText
            updateChat(
              uuid.value,
              chatIdx,
              {
                dateTime: new Date().toLocaleString(),
                text: result,
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: null,
                requestOptions: { prompt: message, options: { ...options } },
                type: 'source_documents',
                sourceDocumentsTypeData: {
                  answer: data.answer,
                  source_documents: data.source_documents,
                },
              },
            )
            scrollToBottomIfAtBottom()
          }
        },
        (error) => {
          messageFunction.error(error)
          if (!stopCtrl.value.get(chatIdx)) {
            loading.value = false
            onRegenerateing.value = false
            updateChatSome(uuid.value, chatIdx, { loading: false })
            chatStore.setIsChatLoading(false)
          }
          else {
            stopCtrl.value.delete(chatIdx)
          }
        },
        () => {
          queryContent.value = ''
          if (!stopCtrl.value.get(chatIdx)) {
            loading.value = false
            onRegenerateing.value = false
            updateChatSome(uuid.value, chatIdx, { loading: false })
            chatStore.setIsChatLoading(false)
          }
          else {
            stopCtrl.value.delete(chatIdx)
          }
        },
      )
    }).catch((_err) => {
    }).finally(() => {
    })
  }
  catch (error) {
    chatStore.setIsChatLoading(false)
  }
}

async function onConversation() {
  chatStore.setIsChatLoading(true)
  if (loading.value)
    return
  if (onRegenerateing.value)
    return
  if (!accessToken.value) {
    messageFunction.error(t('common.unauthorizedTips'))
    return
  }
  const message = prompt.value
  const selectedContent = quoteStr.value
  history.value = []

  if (!message || message.trim() === '')
    return

  controller = new AbortController()
  addChat(
    uuid.value,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      selectedContent,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  scrollToBottom()

  // 清理选中 query
  clearSelectedQuery()
  loading.value = true
  prompt.value = ''

  if (stopCtrl.value) {
    stopCtrl.value.set(dataSources.value.length - 1, false)
  }
  else {
    stopCtrl.value = new Map()
    stopCtrl.value.set(dataSources.value.length - 1, false)
  }

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(
    uuid.value,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      loading: true,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  scrollToBottom()

  try {
    const lastText = ''
    let res, result
    const fetchChatAPIOnce = async () => {
      // send prompt to get response
      switch (currentChatMode.value) {
        case 1:
          await postChatPublicRepoStream({
            question: message,
            history: history.value,
            model: chatStore.selectedModel,
            knowledge_base_id: chatStore.knowledgeRepo.filter((ele: any) => ele.selected)[0].children.filter((ele: any) => ele.checked).map((ele: any) => {
              return {
                id: chatStore.knowledgeRepo.filter((ele: any) => ele.selected)[0].name,
                filter: 'time',
                timeRange: [ele.startDate, ele.endDate],
              }
            }),
          }, message, dataSources.value.length - 1, options)
          return
        case 2:
          // eslint-disable-next-line no-case-declarations
          const kbs = chatStore.myFileList.filter((ele: any) => ele.selected).map(ele => ({
            id: ele.kb_name,
            type: 1,
            fileName: ele.children.filter((ele: { isSelected: any }) => ele.isSelected).map((ele: any) => ele.name),
          }))
          if (kbs[0].fileName.length === 0)
            messageFunction.error('请选择至少一个文件或先上传文件')
          await postChatMyKbStream({
            kbs,
            question: message,
            history: history.value,
            model: chatStore.selectedModel,
            selectedContent: quoteStr.value,
          }, message, dataSources.value.length - 1, options)

          return
        default:
          res = await chat({
            question: message,
            history: history.value,
          })
          result = res.data.source_documents?.length > 0 ? `${res.data.response}\n\n数据来源：\n\n>${res.data.source_documents.join('>')}` : res.data.response
          updateChat(
            uuid.value,
            dataSources.value.length - 1,
            {
              dateTime: new Date().toLocaleString(),
              text: lastText + (result ?? ''),
              inversion: false,
              error: false,
              loading: false,
              conversationOptions: null,
              requestOptions: { prompt: message, options: { ...options } },
            },
          )
          scrollToBottomIfAtBottom()
          loading.value = false
          updateChatSome(uuid.value, dataSources.value.length - 1, { loading: false })
      }
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        uuid.value,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(uuid.value, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        uuid.value,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      uuid.value,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    //
  }
}

async function onRegenerate() {
  if (loading.value)
    return
  if (onRegenerateing.value)
    return
  if (!accessToken.value) {
    messageFunction.error(t('common.unauthorizedTips'))
    return
  }
  controller = new AbortController()

  onRegenerateing.value = true

  updateChatSome(uuid.value, dataSources.value.length - 1, { loading: true, text: '' })

  history.value = []
  if (usingContext.value) {
    for (let i = 0; i < dataSources.value.length - 2; i = i + 2)
      history.value.push([dataSources.value[i].text, dataSources.value[i + 1].text.split('\n\n数据来源：\n\n>')[0]])
  }
  else { history.value.length = 0 }

  const { requestOptions } = dataSources.value[dataSources.value.length - 1]

  const message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  try {
    const lastText = ''
    let res, result
    const fetchChatAPIOnce = async () => {
      // send prompt to get response
      switch (currentChatMode.value) {
        case 1:
          await postChatPublicRepoStream({
            question: message,
            history: history.value,
            model: 'claude 2',
            knowledge_base_id: chatStore.knowledgeRepo.filter((ele: any) => ele.selected)[0].children.filter((ele: any) => ele.checked).map((ele: any) => {
              return {
                id: chatStore.knowledgeRepo.filter((ele: any) => ele.selected)[0].name,
                filter: 'time',
                timeRange: [ele.startDate, ele.endDate],
              }
            }),
          }, message, dataSources.value.length - 1, options)
          return
        case 2:
          // eslint-disable-next-line no-case-declarations
          const kbs = chatStore.myFileList.filter((ele: any) => ele.selected).map(ele => ({
            id: ele.kb_name,
            type: 1,
            fileName: ele.children.filter((ele: { isSelected: any }) => ele.isSelected).map((ele: any) => ele.name),
          }))
          if (kbs[0].fileName.length === 0)
            messageFunction.error('请选择至少一个文件或先上传文件')
          await postChatMyKbStream({
            kbs,
            question: message,
            history: history.value,
            model: 'claude 2',
          }, message, dataSources.value.length - 1, options)
          return
        default:
          res = await chat({
            question: message,
            history: history.value,
          })
          result = res.data.source_documents?.length > 0 ? `${res.data.response}\n\n数据来源：\n\n>${res.data.source_documents.join('>')}` : res.data.response
          updateChat(
            uuid.value,
            dataSources.value.length - 1,
            {
              dateTime: new Date().toLocaleString(),
              text: lastText + (result ?? ''),
              inversion: false,
              error: false,
              loading: false,
              conversationOptions: null,
              requestOptions: { prompt: message, options: { ...options } },
            },
          )
          scrollToBottomIfAtBottom()
          loading.value = false
          onRegenerateing.value = false
          updateChatSome(uuid.value, dataSources.value.length - 1, { loading: false })
      }
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        uuid.value,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      return
    }
    const errorMessage = error?.message ?? t('common.wrong')
    updateChat(
      uuid.value,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
  }
  finally {
    loading.value = false
  }
}

function clearQuote() {
  chatStore.setQuote('')
}

function clearSelectedQuery() {
  chatStore.setSelectedQuery('')
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(uuid.value, index)
    },
  })
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
    queryContent.value = ''
    // stopCtrl 停止返回结果控制
    stopCtrl.value.set(dataSources.value.length - 1, true)

    // 设置 chat londing 状态为 false
    chatStore.setIsChatLoading(false)

    updateChatSome(uuid.value, dataSources.value.length - 1, { loading: false })
  }
}

function handleStopRecognizing() {
  recognizing.value = false
  speeching.value = false
  controller.abort()
  speechWS?.close()
  speechWS = null
}

const handleStopRecording = () => {
  if (speeching.value) {
    speeching.value = false
    recognizing.value = true
    recorder.stopRecording(stopRecordingCallback)
  }
}

watch(chatStore, () => {
  quoteStr.value = chatStore.quote
  // 如果引用不为空，控制滑块到最底部，防止出现遮挡
  if (chatStore.quote.length !== 0)
    scrollToBottomIfAtBottom()

  if (chatStore.selectedQuery.length !== 0) {
    prompt.value = chatStore.selectedQuery
    onConversation()
  }

  currentChatMode.value = chatStore.chatMode
  currentFolder.value = chatStore.chatMode === 1 ? chatStore?.knowledgeRepo?.filter((ele: any) => ele.selected)[0]?.name : chatStore.myFileList.filter((ele: any) => ele.selected)[0]?.kb_name

  currentSelectedFiles.value = chatStore.myFileList.filter(ele => ele.selected)[0]?.children.filter((ele: { isSelected: any }) => ele.isSelected).map((ele: { name: any }) => ele.name)
}, { deep: true })

watch(appStore, () => {
  currentThemeName.value = appStore.theme
})
watch(currentFolder, async (newVal) => {
  if (!newVal)
    return
  await chatStore.updateWholeChatByUuid(uuid.value, [])
  await postConversationRecord(newVal
    , accessToken.value).then(async (res) => {
    const temp = res.data.data.map((ele: string) => (JSON.parse(ele))).map((ele: any) => {
      return {
        text: ele.content,
        dateTime: ele.time,
        loading: false,
        inversion: ele.role === 'Human',
        error: false,
        selectedContent: ele.select_content,
        shouldNotHaveRegenerateIcon: true,
      }
    })
    const uuid = res.data.uid
    await chatStore.updateWholeChatByUuid(uuid, temp)
    await chatStore.setActive(uuid)
    console.log('postConversationRecord', res)
    router.replace({ name: 'Chat', params: { uuid: chatStore.active } })
  })

  announcementContent.value = `已加载${kb_EN_CN_convertion[newVal] || newVal}，可以对此进行对话提问`
  showAnnoucement.value = true

  if (currentChatMode.value === 1) {
    postGenerateGeneralQuery({ id: newVal, type: mapCurrentChatModeToType[currentChatMode.value] }, accessToken).then((res) => {
      addChat(
        uuid.value,
        {
          dateTime: new Date().toLocaleString(),
          text: '2',
          loading: false,
          inversion: false,
          error: false,
          conversationOptions: null,
          shouldNotHaveRegenerateIcon: true,
          // below is about regenerate logic
          requestOptions: {
            prompt: 'generate general query',
            options: {},
          },
          type: 'general_query',
          generalQueryData: {
            abstract: res.data.abstract,
            querys: res.data.querys,
          },
        },
      )
      scrollToBottom()
    })
  }
  else {
    // 先判断该目录下是否有文件，没有文件不需要请求接口
    if (!(currentSelectedFiles.value && currentSelectedFiles.value.length !== 0))
      return

    const payload = {
      kb_name: currentFolder.value,
      files_name: currentSelectedFiles.value,
    }
    const auth = accessToken?.value || ''

    const debouncedPostGenerateAbstractInMyKb = _.debounce((payload: { files_name: any[] }, auth: string) => {
      PostGenerateAbstractInMyKb([payload], auth)
        .then((res) => {
          // knowledgeContentRef.value = `${res.data.data.file_abstract?.map((ele: { name: any; abstract: any }) => `文件名称：${ele.name}\n总结：${ele.abstract}\n`).join('\n') || ''}`
          addChat(
            uuid.value,
            {
              dateTime: new Date().toLocaleString(),
              text: '2',
              loading: false,
              inversion: false,
              error: false,
              conversationOptions: null,
              shouldNotHaveRegenerateIcon: true,
              // below is about regenerate logic
              requestOptions: {
                prompt: 'generate general query',
                options: {},
              },
              type: 'abstract',
              abstractData: {
                kb_abstract: res.data.data.kb_abstract?.abstract ?? '',
                file_abstract: res.data.data.file_abstract ?? [],
              },
            },
          )
          scrollToBottom()
        })
        .catch((err) => {
          if (err === 401)
            useMessage().error('401,请重新登录')
        })
    }, 1500)

    debouncedPostGenerateAbstractInMyKb(payload, auth)
  }
})
watch(showAnnoucement, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showAnnoucement.value = false
    }, 3000)
  }
})
watch(() => route.params.uuid, (newUuid, _oldUuid) => {
  uuid.value = newUuid
})

watch(recognizing, (newVal) => {
	if(newVal) {
		recognizerTimer = setTimeout(() => {
			handleStopRecognizing()
		}, 30000)
	}else{
		clearTimeout(recognizerTimer)
	}
})
onMounted(() => {
  scrollToBottom()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
  setTimeout(() => {
    showAnnoucement.value = false
  }, 3000)
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})
</script>

<template>
  <div class="flex flex-col w-full h-full " style="position: relative;  background: rgba(245, 247, 253, 1);
">
    <div v-if="showAnnoucement" class="announcement" style="position: absolute;top: 10px;left: 10px;">
      <img class="icon24" style="display: inline-block;" src="@/assets/icon_消息@2x.png"> 系统消息:{{ announcementContent }}
    </div>
    <main class="overflow-hidden" style="height: calc(100% - footerRef.value?.clientHeight);flex:9">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <!-- :class="[isMobile ? 'p-2' : 'p-5']" :style="[{
            'background-color': currentThemeName === 'dark' ? 'rgb(0 0 0 / var(--tw-bg-opacity))' : 'inherit', 'background': '#1C1E25',
          }]" -->
           <div
          id="image-wrapper" class="w-full h-full max-w-screen-xl m-auto "
         style="background: rgba(245, 247, 253, 1);"
        >
          <!-- <template v-if="!dataSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
              <span>Aha~</span>
            </div>
          </template> -->
        <!-- v-else  -->
         <template >
            <div>
              <Message
                v-for="(item, index) of dataSources" :key="index" :date-time="item.dateTime" :text="item.text"
                :inversion="item.inversion" :error="item.error" :loading="item.loading" :query-content="queryContent"
                :regenerate="index === (dataSources.length - 1) && !onRegenerateing" :type="item.type"
                :source-documents-type-data="item.sourceDocumentsTypeData" :general-query-data="item.generalQueryData"
                :should-not-have-regenerate-icon="item.shouldNotHaveRegenerateIcon"
                :selected-content="item.selectedContent" :abstract-data="item.abstractData" @regenerate="onRegenerate"
                @delete="handleDelete(index)" @scrollToBottom="scrollToBottom"
              />
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  停止响应
                </NButton>
                <div v-if="speeching || recognizing" type="warning">
                  <div v-if="recognizing" class="stopRecoginizing flex" @click="handleStopRecognizing">
                    <span>录音内容识别中</span>
                  </div>
                  <div v-else class="flex stopRecording flex" @click="handleStopRecording">
                    <div class='purpleDot'>
                    </div>
                    <span>停止</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>

    <footer ref="footerRef" class="pt-3 pb-1" style="height: fit-content;margin-left: 20px;margin-right: 20px;">
      <div
        v-if="quoteStr.length !== 0" class="w-full"
        style="position: relative; margin-bottom: 10px; height: fit-content;min-height: 50px;"
      >
        <NInput
          ref="inputRef" v-model:value="quoteStr" class="flex items-center justify-center"
          style="padding-right: 50px; height: 100%;min-height: 50px;border-radius: 10px 10px 10px 10px" type="textarea"
          placeholder="" :autosize="{ minRows: 1, maxRows: isMobile ? 2 : 4 }" disabled
        />
        <NButton size="tiny" class="submit-button rotate-image" text @click="clearQuote">
          <NIcon size="20">
            <img src="@/assets/icon_添加@2x.png">
          </NIcon>
        </NButton>
      </div>
      <div class="w-full max-w-screen-xl m-auto flex align-center" style="height: fit-content; min-height: 50px;">
        <div class="w-full flex" style="position: relative; height: fit-content;min-height: 50px;">
          <div>
            <!-- :src="speeching ? speechOn : speechOff"  -->
            <img
              v-if="!loading && !chatStore.isChatLoading" class="speech-button"
              :src = 'new_conversation'
              style="opacity: 1" @click="handleSpeech"
            >
            <div v-else class="cannot-send-icon" />
          </div>
          <NInput
            ref="inputRef" v-model:value="prompt" class="flex items-center justify-center"
            style="padding-right: 50px; height: 100%;min-height: 50px;border-radius: 10px 10px 10px 10px; background:white !important;
            "
            type="textarea" :placeholder="placeholder" :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
            @keyup.enter="handleKeyDown"
          />
          <div>
            <img
              v-if="!loading && !chatStore.isChatLoading" class="submit-button" src="@/assets/icon_发送@2x.png"
              style="opacity: 1" @click="handleSubmit"
            >
            <div v-else class="cannot-send-icon" />
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="less">
#app {
	background-image: url(../../assets/bg.jpg);
	background-size: 100% 100%;

}

.rotate-image {
	transform: rotate(45deg);
}

.bg-grey {
	background-color: #1C1E25;
}

.n-layout {
	background-color: rgba(250, 250, 250, 0.5);
}

.n-layout-sider {
	background-color: rgba(250, 250, 250, 0.5);
}

.n-switch__button {
	font-size: 10px;
}

.shadow-md {
	box-shadow: 0 12px 40px 0 rgba(148, 186, 215, .2);
	border: 1px solid;
}

.announcement {
	width: calc(100% - 20px);
	background: #2E313C;
	border-radius: 10px 10px 10px 10px;
	opacity: 1;
	padding: 10px;
	font-size: 14px;
	font-weight: 400;
	color: rgba(255, 255, 255, 0.7);
}

.speech-button {
	// position: absolute;
	// bottom: 5px;
	// right: 50px;
	width: 40px !important;
}

.submit-button {
	position: absolute;
	bottom: 5px;
	right: 5px;
	width: 40px !important;
}

.stopRecoginizing {
	padding: 9px 23px;
	align-items: center;
	color: rgba(96, 127, 255, 1);
	background: rgba(16, 17, 20, 0.39);
	border-radius: 10px;
	border: 1px solid #607FFF;
}

.stopRecording {
	align-items: center;
	padding: 9px 23px;
	color: rgba(96, 127, 255, 1);
	background: rgba(16, 17, 20, 0.39);
	border-radius: 10px;
	border: 1px solid #607FFF;
.purpleDot{
	width: 14px;
	height: 14px;
	background: rgba(96,127,255,0.39);
	border-radius: 4px;
	margin-right:8px;
}
}
</style>
