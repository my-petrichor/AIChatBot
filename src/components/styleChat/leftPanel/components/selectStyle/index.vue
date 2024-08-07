<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, reactive } from 'vue'
import {
    NButton, NDatePicker, NDropdown, NForm, NFormItem, NIcon, NInput, NModal, NRadio, NSelect, NSpace,
    NUpload, NUploadDragger, useMessage
} from 'naive-ui'
import {useRouter} from "vue-router"
import { ArrowBackIosFilled } from '@vicons/material'
import { useStyledChatStore } from '@/store/modules/styledChat'

const styledChatStore = useStyledChatStore();
const router = useRouter()
const presetForm = ref({
    textStyle: 'test',
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
    // set chatSendDisable
    styledChatStore.setChatSendDisable(true)
    styledChatStore.triggerEvent({ type: 'addChat', data: {...presetForm.value,type:'styledChat',prompt: `根据风格${presetForm.value.textStyle}改写以下文案${presetForm.value.inputText}`} });
    message.success('电子文案生成成功')
}

const getTextStyleList = () => {}

function goHome() {
    router.push('/')
}

onMounted(async () => {
    // const res = await getTextStyleList({})
    // res?.data?.data?.forEach((item: any) => {
    //     textStyleList.value.push({
    //         value: item.value,
    //         label: item.label,
    //         })
    // })
})
</script>

<template>
    <div style="width: 100%">
        <div class="flex justify-between flex-wrap">
            <div style="background-color: rgba(255, 255, 255, 1); display:flex;
            justify-content:center;align-items:center; border-radius:2px; margin-bottom:0;
            color: #0d1117; font-size: 1.3em;">
                <NButton :bordered="false" quaternary strong color="#0d1117"  @click="goHome">
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
                <NInput v-model:value="presetForm.inputText" type="textarea" :autosize="{ minRows: 20, }" placeholder="请输入" />
            </NFormItem>
            <NButton type="info" size="large" @click="handleSubmit">确认</NButton>
        </NForm>
    </div>
</template>

<style scoped lang="less">

</style>