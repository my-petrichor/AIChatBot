<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { Message } from '@/components/views/chat/components'
import { NButton, NInput,useMessage } from 'naive-ui'
import new_conversation from '@/assets/new_conversation.png'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { useScroll } from '@/components/views/chat/hooks/useScroll';
import { useChat } from '@/components/views/chat/hooks/useChat'
import { chat, chatMyKbStream, styleConverstionStream, PostQueryMerge } from '@/api/chat';
import { t } from '@/locales';
import { PostLoginToChat } from '@/api/chat'
import { useStyledChatStore } from '@/store/modules/styledChat';
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex, updateWholeChatByUuid, } = useChat()
const messageFunction = useMessage()
const appStore = useAppStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const route = useRoute()
const uuid = ref<any>(route.params.uuid)
const dataSources = computed(() => chatStore.getChatByUuid(uuid.value) ?? [])
const isMobile = ref(false)
const currentThemeName = ref(appStore.theme)
const loading = ref(false)
const currentChatMode = ref(1)
const stopCtrl = ref<any>()
const footerRef = ref(null); // Ref for the element you want to scroll to

const accessToken = computed(() => userStore.accessToken)
const styledChatStore = useStyledChatStore()
const history = computed(() => dataSources.value.map(item => item.text).reduce((acc:any[], item, index) => {
    const chunkIndex = Math.floor(index / 2);
    if (!acc[chunkIndex]) {
        acc[chunkIndex] = []; // Start a new chunk
    }
    acc[chunkIndex].push(item);
    return acc;
}, []))
const clearQuote = () => { }
const handleSpeech = () => { }
const handleKeyDown = (event) => {
	console.log('handleKeyDown',event)
	//listen to the combination of shift + enter
	if (event.key === 'Enter' && event.shiftKey) {
		console.log('Shift + Enter')
		return
	}
	if (event.key === 'Enter') {
		console.log('Enter')
		handleSubmit()
}
 }
const handleSubmit = () => {
	if (prompt.value.trim() === '') {
		return
	}
	if (loading.value) {
		return
	}
	scrollToBottom()
	onConversation()
	prompt.value = ''
}
const createNewConvesation = () => {
	updateWholeChatByUuid(uuid.value, [])
	prompt.value = ''
}
const placeholder = ref('请输入内容')
const prompt = ref<string>('')
const quoteStr = ref<string>('')
const speeching = ref(false)
const speechOn = ref('')
const speechOff = ref('')
const queryContent = ref("")
const onRegenerateing = ref(false)
let controller = new AbortController()
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))
function clearSelectedQuery() {
	chatStore.setSelectedQuery('')

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

			console.log('params', params)
			styleConverstionStream(
				{
					"query": params.question,
					"writing_style": styledChatStore.currentChatStyle,
					"historys": params.history
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
	}).catch ((_err) => {
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
	// if (!accessToken.value) {
	// 	messageFunction.error(t('common.unauthorizedTips'))
	// 	return
	// }
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
						// knowledge_base_id: chatStore.knowledgeRepo.filter((ele: any) => ele.selected)[0].children.filter((ele: any) => ele.checked).map((ele: any) => {
						// 	return {
						// 		id: chatStore.knowledgeRepo.filter((ele: any) => ele.selected)[0].name,
						// 		filter: 'time',
						// 		timeRange: [ele.startDate, ele.endDate],
						// 	}
						// }),
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

	// history.value = []
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

onMounted(() => {
	if (!getChatByUuidAndIndex(uuid.value, 0)) {
		updateWholeChatByUuid(uuid.value, [])
	}
	PostLoginToChat({ password: "secret", username: "admin" }).then((res) => {
		userStore.setAccessToken(res.data.data.access_token)
	})
	// console.log("onMounted",scrollRef.value,scrollRef.value.scrollTop,scrollRef.value.scrollHeight)
	// // scrollToBottom()
	// if (scrollRef.value) {    // Make sure the element exists
    // scrollRef.value.scrollTop = scrollRef.value.scrollHeight;  // Scroll to the bottom
	// console.log("onMounted2",scrollRef.value,scrollRef.value.scrollTop,scrollRef.value.scrollHeight)}
	footerRef.value.scrollIntoView({
      behavior: 'smooth', // Smooth scrolling animation
      block: 'start' // Scroll to the top of the element (optional)
    }); 
  
})
</script>
<template>
	<div id="scrollRef" ref="scrollRef" class="flex flex-col w-full h-full bg-grey " style="position: relative;background: rgba(245, 247, 253, 1);">
		<main class="overflow-hidden" style="height: calc(100% - footerRef.value?.clientHeight);flex:9">
			<!-- id="scrollRef" ref="scrollRef" -->
			<div class="h-full overflow-hidden overflow-y-auto">
				<div id="image-wrapper" class="w-full h-full max-w-screen-xl m-auto dark:bg-[#101014]"
				style="background: rgba(245, 247, 253, 1);"
				>

					<div>
						<Message v-for="(item, index) of dataSources" :key="index" :date-time="item.dateTime" :text="item.text"
							:inversion="item.inversion" :error="item.error" :loading="item.loading"
							:regenerate="index === (dataSources.length - 1) && !onRegenerateing" :type="item.type"
							:should-not-have-regenerate-icon="item.shouldNotHaveRegenerateIcon"
							:selected-content="item.selectedContent" :abstract-data="item.abstractData"
							@scrollToBottom="scrollToBottom" />
					</div>
				</div>
			</div>
		</main>
		<footer ref="footerRef" class="pt-3 pb-1" style="height: fit-content;margin-left: 20px;margin-right: 20px;">
			<div class="w-full max-w-screen-xl m-auto flex align-center" style="height: fit-content; min-height: 50px;">
				<div class="w-full flex" style="position: relative; height: fit-content;min-height: 50px;">
					<div>
						<img class="speech-button"               :src = 'new_conversation'
						style="opacity: 1" @click="createNewConvesation">
					</div>
					<NInput ref="inputRef" v-model:value="prompt" class="flex items-center justify-center"
						style="padding-right: 50px; height: 100%;min-height: 50px;border-radius: 10px 10px 10px 10px"
						type="textarea" :placeholder="placeholder" :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
						@keyup.enter="handleKeyDown" />
					<div>
						<img class="submit-button" src="@/assets/icon_发送@2x.png" style="opacity: 1" @click="handleSubmit">
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

	.purpleDot {
		width: 14px;
		height: 14px;
		background: rgba(96, 127, 255, 0.39);
		border-radius: 4px;
		margin-right: 8px;
	}
}
</style>
