<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue'
import {
    NButton, NDatePicker, NDropdown, NForm, NFormItem, NIcon, NInput, NModal, NRadio, NSelect, NSpace,
    NUpload, NUploadDragger, useMessage
} from 'naive-ui'
import {useRouter} from "vue-router"
import { ArrowBackIosFilled } from '@vicons/material'
import { useStyledChatStore } from '@/store'

const router = useRouter()
const presetForm1 = ref({
    characterSetting: '',
    shoppingLabel: '',
    discount: '',
})
const presetForm2 = ref({
    shopName: '',
    ownerName: '',
    gender: '',
    age: '',
})
const characterSettingList = ref<any>([])
const message = useMessage()
const labelStyle = reactive({
    fontSize: "1em",
    fontWeight: "bold",
    color: "#0d1117",
})
const { setChatSendDisable } = useStyledChatStore()

const handleSubmit = () => {
    if (!presetForm1.value.characterSetting || !presetForm1.value.discount) {
        message.error('请填写完整的会员信息')
        return
    }
    message.success('电子文案生成成功')
    setChatSendDisable(false)
}

const getCharacterSettingList = () => {}

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
                <NButton :bordered="false" quaternary strong color="#0d1117"  @click="goHome">
                    <template #icon>
                        <n-icon>
                            <ArrowBackIosFilled />
                        </n-icon>
                    </template>
                </NButton>
                <span :style="labelStyle">会员促活文案</span>
            </div>
        </div>
        <NForm label-placement="top">
            <NFormItem label="品牌人设" label-width="auto" :label-style="labelStyle">
                <NSelect v-model:value="presetForm1.characterSetting" :options="characterSettingList"  placeholder="请选择" />
            </NFormItem>
            <p style="margin-bottom:2vh; color: #0d1117; font-size: 1em; font-weight: bold;">会员标签设定</p>
            <NForm label-placement="left"
                   label-width="auto">
                <NFormItem label="店铺名">
                    <NInput v-model:value="presetForm2.ownerName" placeholder="请输入" />
                </NFormItem>
                <NFormItem label="性别">
                    <NInput v-model:value="presetForm2.gender" placeholder="请输入" />
                </NFormItem>
                <NFormItem label="年龄">
                    <NInput v-model:value="presetForm2.age" placeholder="请输入" />
                </NFormItem>
            </NForm>
            <NFormItem label="购买标签" label-width="auto" :label-style="labelStyle">
                <NInput v-model:value="presetForm1.shoppingLabel" placeholder="请输入" />
            </NFormItem>
            <NFormItem label="优惠内容" label-width="auto" :label-style="labelStyle">
                <NInput v-model:value="presetForm1.discount" placeholder="请输入" />
            </NFormItem>
            <NButton type="info" size="large" @click="handleSubmit">生成促活文案</NButton>
        </NForm>
    </div>
</template>

<style scoped lang="less">

</style>