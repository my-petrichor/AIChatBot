<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
    NButton, NDatePicker, NDropdown, NForm, NFormItem, NIcon, NInput, NModal, NRadio, NSelect, NSpace,
    NUpload, NUploadDragger, useMessage
} from 'naive-ui'
import { useRouter } from "vue-router"
import { ArrowBackIosFilled } from '@vicons/material'
import { useStyledChatStore } from '@/store/modules/styledChat'

const router = useRouter()
const presetForm = ref({
    characterSetting: '',
    shoppingType: '',
    festival: '',
    platform: '',
    discount: '',
})
const characterSettingList = ref<any>([])
const shoppingTypeList = ref<any>([])
const message = useMessage()
const labelStyle = reactive({
    fontSize: "1em",
    fontWeight: "bold",
    color: "#0d1117",
})
const { setChatSendDisable } = useStyledChatStore()
const handleSubmit = () => {
    if (!presetForm.value.characterSetting || !presetForm.value.discount) {
        message.error('请填写完整的会员信息')
        return
    }
    styledChatStore.triggerEvent({ type: 'addChat', data: { ...presetForm.value, type: 'memberPromotion' } });
    message.success('电子文案生成成功')

    setChatSendDisable(false)
}

const getCharacterSettingList = () => { }
const getShoppingTypeList = () => { }

function goHome() {
    router.push('/')
}

onMounted(async () => {
    setChatSendDisable(true)
    // const res = await getCharacterSettingList({})
    // res?.data?.data?.forEach((item: any) => {
    //     characterSettingList.value.push({
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
            justify-content:center;align-items:center; border-radius:2px; margin-bottom:4vh;
            color: #0d1117; font-size: 1.3em;">
                <NButton :bordered="false" quaternary strong color="#0d1117" @click="goHome">
                    <template #icon>
                        <n-icon>
                            <ArrowBackIosFilled />
                        </n-icon>
                    </template>
                </NButton>
                <span :style="labelStyle">营销写作</span>
            </div>
        </div>
        <NForm label-placement="top">
            <NFormItem label="品牌人设" label-width="auto" :label-style="labelStyle">
                <NSelect v-model:value="presetForm.characterSetting" class="mb-2" :options="characterSettingList"
                    placeholder="请选择" />
            </NFormItem>
            <NFormItem label="店铺类型" label-width="auto" :label-style="labelStyle">
                <NSelect v-model:value="presetForm.shoppingType" class="mb-2" :options="shoppingTypeList"
                    placeholder="请选择" />
            </NFormItem>
            <NFormItem label="节日" label-width="auto" :label-style="labelStyle">
                <NInput v-model:value="presetForm.festival" placeholder="请输入" />
            </NFormItem>
            <NFormItem label="平台" label-width="auto" :label-style="labelStyle">
                <NInput v-model:value="presetForm.platform" placeholder="请输入" />
            </NFormItem>
            <NFormItem label="优惠内容" label-width="auto" :label-style="labelStyle">
                <NInput v-model:value="presetForm.discount" placeholder="请输入" />
            </NFormItem>
            <NFormItem>
                <NButton type="info" size="large" @click="handleSubmit">生成</NButton>
            </NFormItem>
        </NForm>
    </div>
</template>

<style scoped lang="less"></style>