<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { NSplit, NH1, NH2, NButton } from 'naive-ui'
//useStyleStore
import { useStyledChatStore } from '@/store/modules/styledChat'
import { useRoute } from 'vue-router'
import { useChat } from '@/components/views/chat/hooks/useChat'

import { getWritingStyleList } from '@/api/chat'

const { setCurrentChatStyle } = useStyledChatStore()

const route = useRoute()
const { updateWholeChatByUuid, } = useChat()
const uuid = ref<any>(route.params.uuid)
const style = ref<any[]>([])
const currentStyle = ref('')


const changeStyle = (style: string) => {
	console.log('changeStyle', style)
	setCurrentChatStyle(style)
	updateWholeChatByUuid(uuid.value, [])
}

watch(currentStyle, (style) => {
	changeStyle(style)
})

onMounted(() => {
	getWritingStyleList().then(res => {
		style.value = res.data.data.map((ele: { style_chinese_name: any; style: any }) => {
			return {
				name: ele.style_chinese_name,
				value: ele.style
			}
		})
		currentStyle.value = style?.value[0]?.value
	})
})
</script>

<template>
	<div>
		<NH1>
			选择风格
		</NH1>
		<div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
			<NButton style="margin-bottom: 10px;
	width: 80%;
	" v-for="item in style" :key="item.value" :style="{ marginBottom: '10px' }" @click="currentStyle = item.value"
				:type="currentStyle === item.value ? 'primary' : 'default'">
				{{ item.name }}
			</NButton>
		</div>
	</div>
</template>
