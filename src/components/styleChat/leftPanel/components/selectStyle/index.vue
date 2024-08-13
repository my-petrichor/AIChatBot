<script setup lang="ts">
import { onMounted, ref, reactive, watch,computed } from 'vue'
import {
    NButton, NForm, NFormItem, NIcon, NInput, NModal, NRadio, NSelect, useMessage
} from 'naive-ui'
import { useRouter } from "vue-router"
import { ArrowBackIosFilled } from '@vicons/material'
import { useStyledChatStore } from '@/store/modules/styledChat'
import { getWritingStyleList2 } from '@/api/chat'

const styledChatStore = useStyledChatStore();
const chatSendDisable = computed(() => styledChatStore.chatSendDisable)
const router = useRouter()
const presetForm = ref({
    textStyle: '',
    inputText: '',
})
const textStyleList = ref<any>([])
const message = useMessage()
const labelStyle = reactive({
    fontSize: "1em",
    fontWeight: "bold",
    color: "#0d1117",
})

const handleSubmit = () => {
    if (!presetForm.value.textStyle || !presetForm.value.inputText) {
        message.error('请填写完整的会员信息')
        return
    }
    styledChatStore.triggerEvent({ type: 'addChat', data: { ...presetForm.value, type: 'selectStyle', prompt: `${presetForm.value.inputText}` } });

}



function goHome() {
    router.push('/')
}

onMounted(async () => {
    await getWritingStyleList2().then((res2: { data: { data: any[] } }) => {
        textStyleList.value = res2.data.data.map((item: any) => {
            return {
                label: item,
                value: item,
            }
        })
        presetForm.value.textStyle = textStyleList.value[0].value
    })
})


</script>

<template>
    <div style="width: 100%">
        <div class="flex justify-between flex-wrap">
            <div style="background-color: rgba(255, 255, 255, 1); display:flex;
            justify-content:center;align-items:center; border-radius:2px; margin-bottom:0;
            color: #0d1117; font-size: 1.3em;">
                <NButton :bordered="false" quaternary strong color="#0d1117" @click="goHome">
                    <template #icon>
                        <n-icon>
                            <ArrowBackIosFilled />
                        </n-icon>
                    </template>
                </NButton>
                <span :style="labelStyle">选择风格</span>
            </div>
        </div>
        <NForm label-placement="top">
            <NFormItem>
                <NSelect v-model:value="presetForm.textStyle" class="mb-2" :options="textStyleList" placeholder="请选择" />
            </NFormItem>
            <NFormItem label="输入需要改写的文本" label-width="auto" :label-style="labelStyle">
                <NInput v-model:value="presetForm.inputText" type="textarea" :autosize="{ minRows: 20, }"
                    placeholder="请输入" />
            </NFormItem>
            <NButton
            :disabled="!presetForm.textStyle || !presetForm.inputText || chatSendDisable"
             type="info" size="large" @click="handleSubmit">确认</NButton>
        </NForm>
    </div>
</template>

<style scoped lang="less"></style>