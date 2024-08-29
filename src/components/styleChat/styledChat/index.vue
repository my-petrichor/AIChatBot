<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, VNodeChild, watch } from 'vue';
import { useRoute } from 'vue-router'
import { Message } from '@/components/views/chat/components'
import { NInput, useMessage } from 'naive-ui'
import new_conversation from '@/assets/new_conversation.png'
import new_conversation_hover from '@/assets/new_conversation_hover.png'

import { useChatStore, useUserStore } from '@/store'
import { useScroll } from '@/components/views/chat/hooks/useScroll';
import { useChat } from '@/components/views/chat/hooks/useChat'
import {  styleConverstionStream, styleConverstionStreamWithHistory,  memberPromotionConverstionStream, memberPromotionConverstionStreamWithHistory, marketingWritingConverstionStream, marketingWritingConverstionStreamWithHistory } from '@/api/chat';
import { t } from '@/locales';
import { useStyledChatStore } from '@/store/modules/styledChat';
import { storeToRefs } from 'pinia';
const styledChatStore = useStyledChatStore();
const { latestEvent } = storeToRefs(styledChatStore);
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex, updateWholeChatByUuid, } = useChat()
const messageFunction = useMessage()
const userStore = useUserStore()
const chatStore = useChatStore()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const route = useRoute()
const uuid = ref<any>(route.params.uuid)
const dataSources = computed(() => chatStore.getChatByUuid(uuid.value) ?? [])
const isMobile = ref(false)
const loading = ref(false)
const currentChatMode = ref('')
const  isHovered = ref(false)
// const currentChatMode = computed(() => styledChatStore.currentChatStyle)
const stopCtrl = ref<any>()
const footerRef = ref(null);
const placeholder = ref('你可以这样输入:帮我改写下面这段话:文字…')
const prompt = ref<string>('')
const quoteStr = ref<string>('')
const queryContent = ref("")
const onRegenerateing = ref(false)
let controller = new AbortController()
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))
const accessToken = computed(() => userStore.accessToken)
const history = computed(() => dataSources.value.map((item: { text: string; }) => item.text).reduce((acc: any[], item: any, index: number) => {
	const chunkIndex = Math.floor(index / 2);
	if (!acc[chunkIndex]) {
		acc[chunkIndex] = []; // Start a new chunk
	}
	acc[chunkIndex].push(item);
	return acc;
}, []))

let streamParams: any = {}

// TODO: 根据chatSendDisable设置发送按钮 禁用与否
const chatSendDisable = computed(() => styledChatStore.chatSendDisable)
const handleKeyDown = (event: { key: string; shiftKey: any; }) => {
	if (event.key === 'Enter' && event.shiftKey) {
		return
	}
	if (event.key === 'Enter') {
		handleSubmit()
	}
}

const handleSubmit = () => {
	scrollToBottom()
	if (prompt.value.trim() === '') {
		return
	}
	if (loading.value) {
		return
	}
	switch (currentChatMode.value) {
		case 'selectStyle':
		case 'selectStyleWithHistory':
			currentChatMode.value = 'selectStyleWithHistory'
			streamParams = {
				inputText: prompt.value,
				historys: history.value
			}
			onConversation()
			break

		case 'memberPromotion':
		case 'memberPromotionWithHistory':
			// 			{
			//   "query": "string",
			//   "historys": []
			// }
			console.log('memberPromotion prompt.value ', prompt.value, history.value)
			streamParams = {
				query: prompt.value,
				historys: history.value
			}
			currentChatMode.value = 'memberPromotionWithHistory'
			onConversation()
			break
		case 'marketingWriting':
		case 'marketingWritingWithHistory':
			streamParams = {
				query: prompt.value,
				historys: history.value
			}
			currentChatMode.value = 'marketingWritingWithHistory'
			onConversation()
			break
		case 'chat':
			onConversation()
			break
		default:
			break
	}
	prompt.value = ''
}
const createNewConvesation = () => {
	if (loading.value || chatSendDisable.value) {
		return
	}
	updateWholeChatByUuid(uuid.value, [])
	styledChatStore.setChatSendDisable(false)
	loading.value = false
	// prompt.value = ''
}

function clearSelectedQuery() {
	chatStore.setSelectedQuery('')
}

const styleChatStream = async (chatIdx: any) => {
	loading.value = true
	let lastText = ''
	try {
		styleConverstionStream(
			{
				style: streamParams.textStyle,
				text: streamParams.inputText,
				prompt: streamParams.prompt,
			},
			userStore.accessToken,
			() => {
			},
			 (data: { answer: string; source_documents: any; }) => {
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
							// requestOptions: { prompt: message, options: { ...options } },
							type: 'source_documents',
							sourceDocumentsTypeData: {
								answer: data.answer,
								source_documents: data.source_documents,
							},
						},
					)
					scrollToBottom()
				}
			},
			(error: string | (() => VNodeChild)) => {
				messageFunction.error(error)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},
			() => {
				queryContent.value = ''
				styledChatStore.setChatSendDisable(false)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},

		)

	}
	catch (error) {
	}
}

// memberPromotionConverstionStream

const memberPromotionStream = async (chatIdx: any) => {
	loading.value = true
	let lastText = ''
	try {
		memberPromotionConverstionStream(
			{
				brand_owner: streamParams.characterSetting,
				shop_name: streamParams.shopName,
				member_name: streamParams.shopName,
				sex: streamParams.gender,
				age: streamParams.age,
				purchase_label: streamParams.shoppingLabel,
				promotion_content: streamParams.discount,
				prompt: streamParams.prompt,
			},
			userStore.accessToken,
			() => {
			},
			(data: { answer: string; source_documents: any; }) => {
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
							// requestOptions: { prompt: message, options: { ...options } },
							type: 'source_documents',
							sourceDocumentsTypeData: {
								answer: data.answer,
								source_documents: data.source_documents,
							},
						},
					)
					scrollToBottom()
				}
			},
			(error: string | (() => VNodeChild)) => {
				messageFunction.error(error)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},
			() => {
				queryContent.value = ''
				styledChatStore.setChatSendDisable(false)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},

		)

	}
	catch (error) {
	}
}

const marketingWritingStream = async (chatIdx: any) => {
	loading.value = true
	let lastText = ''
	try {
		marketingWritingConverstionStream(
			{
				brand_owner: streamParams.characterSetting,
				shop_type: streamParams.shoppingType,
				festival: streamParams.festival,
				platform: streamParams.platform,
				promotion: streamParams.discount,
				prompt: streamParams.prompt,
			},
			userStore.accessToken,
			() => {
			},
			(data: { answer: string; source_documents: any; }) => {
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
							// requestOptions: { prompt: message, options: { ...options } },
							type: 'source_documents',
							sourceDocumentsTypeData: {
								answer: data.answer,
								source_documents: data.source_documents,
							},
						},
					)
					scrollToBottom()
				}
			},
			(error: string | (() => VNodeChild)) => {
				messageFunction.error(error)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},
			() => {
				queryContent.value = ''
				styledChatStore.setChatSendDisable(false)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},

		)

	}
	catch (error) {
	}
}

const styleChatStreamWithHistory = async (chatIdx: any) => {
	loading.value = true
	let lastText = ''
	try {
		styleConverstionStreamWithHistory(
			{
				historys: streamParams.historys,
				query: streamParams.inputText,
			},
			userStore.accessToken,
			() => {
			},
			(data: { answer: string; source_documents: any; }) => {
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
							type: 'source_documents',
							sourceDocumentsTypeData: {
								answer: data.answer,
								source_documents: data.source_documents,
							},
						},
					)
					scrollToBottom()
				}
			},
			(error: string | (() => VNodeChild)) => {
				messageFunction.error(error)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},
			() => {
				queryContent.value = ''
				styledChatStore.setChatSendDisable(false)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},

		)

	}
	catch (error) {
	}
}

const memberPromotionStreamWithHistory = async (chatIdx: any) => {
	loading.value = true
	let lastText = ''
	try {
		memberPromotionConverstionStreamWithHistory(
			{
				historys: streamParams.historys,
				query: streamParams.query,
			},
			userStore.accessToken,
			() => {
			},
			(data: { answer: string; source_documents: any; }) => {
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
							type: 'source_documents',
							sourceDocumentsTypeData: {
								answer: data.answer,
								source_documents: data.source_documents,
							},
						},
					)
					scrollToBottom()
				}
			},
			(error: string | (() => VNodeChild)) => {
				messageFunction.error(error)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},
			() => {
				queryContent.value = ''
				styledChatStore.setChatSendDisable(false)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},

		)

	}
	catch (error) {
	}
}

const marketingWritingStreamWithHistory = async (chatIdx: any) => {
	loading.value = true
	let lastText = ''
	try {
		marketingWritingConverstionStreamWithHistory(
			{
				historys: streamParams.historys,
				query: streamParams.query,
			},
			userStore.accessToken,
			() => {
			},
			(data: { answer: string; source_documents: any; }) => {
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
							// requestOptions: { prompt: message, options: { ...options } },
							type: 'source_documents',
							sourceDocumentsTypeData: {
								answer: data.answer,
								source_documents: data.source_documents,
							},
						},
					)
					scrollToBottom()
				}
			},
			(error: string | (() => VNodeChild)) => {
				messageFunction.error(error)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},
			() => {
				queryContent.value = ''
				styledChatStore.setChatSendDisable(false)
				if (!stopCtrl.value.get(chatIdx)) {
					loading.value = false
					onRegenerateing.value = false
					updateChatSome(uuid.value, chatIdx, { loading: false })
				}
				else {
					stopCtrl.value.delete(chatIdx)
				}
			},

		)

	}
	catch (error) {
	}
}

async function onConversation() {
	console.log('onConversation')
	if (history.value.length > 50) {
		messageFunction.error(t('本地历史聊天记录，请清空聊天记录后再进行下一次对话'))
		return
	}
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
	// history.value = []

	if (!message || message.trim() === '')
		return
	styledChatStore.setChatSendDisable(true)
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
			// requestOptions: { prompt: message, options: null },
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

	// let options: Chat.ConversationRequest = {}
	// const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

	// if (lastContext && usingContext.value)
	// 	options = { ...lastContext }

	addChat(
		uuid.value,
		{
			dateTime: new Date().toLocaleString(),
			text: '',
			loading: true,
			inversion: false,
			error: false,
			conversationOptions: null,
			// requestOptions: { prompt: message, options: { ...options } },
		},
	)
	scrollToBottom()
	try {
		const fetchChatAPIOnce = async () => {
			switch (currentChatMode.value) {
				case 'selectStyle':
					await styleChatStream(dataSources.value.length - 1)
					break
				case 'selectStyleWithHistory':
					await styleChatStreamWithHistory(dataSources.value.length - 1)
					break
				case 'memberPromotion':
					await memberPromotionStream(dataSources.value.length - 1)
					break
				case 'memberPromotionWithHistory':
					await memberPromotionStreamWithHistory(dataSources.value.length - 1)
					break
				case 'marketingWriting':
					await marketingWritingStream(dataSources.value.length - 1)
					break
				case 'marketingWritingWithHistory':
					await marketingWritingStreamWithHistory(dataSources.value.length - 1)
				case 'chat':
					console.log("chat")
				default:
					break
			}
		}
		await fetchChatAPIOnce()
		scrollToBottom()
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
			scrollToBottom()
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
				// requestOptions: { prompt: message, options: { ...options } },
			},
		)
		scrollToBottom()
	}
	finally {
		scrollToBottom()
	}
}

onMounted(() => {
	if (!getChatByUuidAndIndex(uuid.value, 0)) {
		updateWholeChatByUuid(uuid.value, [])
	}
	styledChatStore.setChatSendDisable(false)
	switch (uuid.value) {
		case 'selectStyle':
			styledChatStore.setCurrentChatStyle('selectStyle')
			currentChatMode.value = 'selectStyle'
			break
		case 'memberPromotion':
			styledChatStore.setCurrentChatStyle("memberPromotion")
			currentChatMode.value = "memberPromotion"
			break
		case 'marketingWriting':
			styledChatStore.setCurrentChatStyle('marketingWriting')
			currentChatMode.value = 'marketingWriting'
			break
		default:
			break
	}

})
watch(latestEvent, (newEvent) => {
	if (newEvent && newEvent.type === 'addChat') {
		switch (newEvent.data.type) {
			case 'selectStyle':
				streamParams = newEvent.data
				currentChatMode.value = 'selectStyle'
				prompt.value = newEvent.data.prompt
				onConversation()
				break
			case 'memberPromotion':
				streamParams = newEvent.data
				currentChatMode.value = "memberPromotion"
				prompt.value = newEvent.data.prompt
				onConversation()
				break
			case 'marketingWriting':
				streamParams = newEvent.data
				currentChatMode.value = 'marketingWriting'
				prompt.value = newEvent.data.prompt
				onConversation()
				break
			default:
				break
		}
	}
});
</script>
<template>
	<div class="flex flex-col w-full h-full bg-grey "
		style="position: relative;background: rgba(245, 247, 253, 1); padding-left:266px;padding-right:266px;">
		<main class="overflow-hidden" style="height: calc(100% - footerRef.value?.clientHeight);flex:9">
			<div class="h-full overflow-hidden overflow-y-auto">
				<div id="image-wrapper " class="w-full h-full max-w-screen-xl m-auto dark:bg-[#101014] pt-10"
					style="background: rgba(245, 247, 253, 1);overflow:scroll" ref="scrollRef">
					<div v-if='dataSources.length > 0'>
						<Message v-for="(item, index) of dataSources" :key="index" :date-time="item.dateTime"
							:text="item.text" :inversion="item.inversion" :error="item.error" :loading="item.loading"
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
					<!--:src='new_conversation' when hover is new_conversation_hover -->
					<div

					 @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
						style="background-color: rgba(255, 255, 255, 1); width: 50px; height:50px;display:flex; justify-content:center;align-items:center; border-radius:2px;margin-right:10px;">
						<img class="speech-button" 
						
						 :src="isHovered ? new_conversation_hover : new_conversation"
						
						style="width: 30px; height:30px;opacity: 1; "
							@click="createNewConvesation">
					</div>
					<NInput ref="inputRef" v-model:value="prompt" class="flex items-center justify-center" style="padding-right: 50px; height: 100%;min-height: 50px;
						background-color: white !important;
						border-radius: 10px 10px 10px 10px" type="textarea" :placeholder="placeholder"
						:autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }" @keyup.enter="handleKeyDown" />
					<NButton>
						<!-- :disabled="chatSendDisable" -->
						<img class="submit-button" src="@/assets/icon_发送@2x.png"
							:class="{ 'disabled': chatSendDisable || loading }" @click="handleSubmit">
					</NButton>
				</div>
			</div>
		</footer>
	</div>
</template>
<style scoped lang="less">
.n-input__placeholder {
	color: red !important;
}

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

.speech-button {}

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

.submit-button {
	opacity: 1;
	/* Default opacity */
	transition: opacity 0.3s ease;
	/* Optional smooth transition */
}

.submit-button.disabled {
	opacity: 0.5;
}
</style>