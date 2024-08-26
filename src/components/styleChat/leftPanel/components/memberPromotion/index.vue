<script setup lang="ts">
import { ref, onMounted, reactive,computed,watch } from 'vue'
import {
    NButton, NForm, NFormItem, NIcon, NInput, NSelect,
    useMessage
} from 'naive-ui'
import { useRouter } from "vue-router"
import { ArrowBackIosFilled } from '@vicons/material'
import { useStyledChatStore } from '@/store/modules/styledChat'
import { getBrandOwnerList ,postGenerateQueryPromptInSalePromotion} from '@/api/chat'

const styledChatStore = useStyledChatStore();
const router = useRouter()
const presetForm1 = ref({
    characterSetting: '',
    shoppingLabel: '',
    discount: '',
})
const presetForm2 = ref({
    shopName: '',
    gender: '',
    age: '',
})
const options = [
    { label: '是', value: '1' },
    { label: '否', value: '0' },
]
const hasPromotionValue = ref('1')
const computedButtonDisableBecauseOfHaveDiscountContent = computed(() => {
    if(hasPromotionValue.value === '0') {
        return false
    }else {
        return presetForm1.value.discount ? false : true
    }
   
})
const computeDisable = computed(() => {
    return !presetForm1.value.characterSetting || !presetForm1.value.shoppingLabel  || !presetForm2.value.shopName || !presetForm2.value || !presetForm2.value.age
})

const chatSendDisable = computed(() => styledChatStore.chatSendDisable)

const characterSettingList = ref<any>([])
const message = useMessage()
const labelStyle = reactive({
    fontSize: "1em",
    fontWeight: "bold",
    color: "#0d1117",
})
const { setChatSendDisable } = useStyledChatStore()

const handleSubmit = () => {
    // if (!presetForm1.value.characterSetting || !presetForm1.value.discount) {
    //     message.error('请填写完整的会员信息')
    //     return
    // }
    postGenerateQueryPromptInSalePromotion({
        brand_owner: presetForm1.value.characterSetting,
        shop_name: presetForm2.value.shopName,
        member_name: presetForm2.value.shopName,
        sex: presetForm2.value.gender,
        age: presetForm2.value.age,
        purchase_label: presetForm1.value.shoppingLabel,
        promotion_content: hasPromotionValue.value === '0' ? '' : presetForm1.value.discount
    }).then((res: { data: { data: any } }) => {
        styledChatStore.triggerEvent({ type: 'addChat', data: { ...presetForm1.value, ...presetForm2.value, prompt: res.data.data, type: 'memberPromotion' } });
    })

}


function goHome() {
    router.push('/')
}
watch(hasPromotionValue, (value) => {
    if(value === '0') {
        presetForm1.value.discount = ''
    }
})
onMounted(async () => {
    setChatSendDisable(true)
    getBrandOwnerList().then((res: { data: { data: any[] } }) => {
        characterSettingList.value = res.data.data.map((item: any) => {
            return {
                label: item,
                value: item,
            }
        })
        presetForm1.value.characterSetting = characterSettingList.value[0].value
    })
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
                <span :style="labelStyle">会员促活文案</span>
            </div>
        </div>
        <NForm label-placement="top">
            <NFormItem label="品牌人设" label-width="auto" :label-style="labelStyle">
                <NSelect v-model:value="presetForm1.characterSetting" :options="characterSettingList"
                    placeholder="请选择" />
            </NFormItem>
            <p style="margin-bottom:2vh; color: #0d1117; font-size: 1em; font-weight: bold;">会员标签设定</p>
            <NForm label-placement="left" label-width="auto">
                <NFormItem label="店铺名">
                    <NInput v-model:value="presetForm2.shopName" placeholder="请输入" />
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
            <NFormItem label="是否有优惠内容" label-width="auto" :label-style="labelStyle">
                <NSelect v-model:value="hasPromotionValue" :options="options" />
            </NFormItem>
            <NFormItem label="优惠内容" label-width="auto" :label-style="labelStyle">
                <NInput 
                :disabled="hasPromotionValue === '0'"

                v-model:value="presetForm1.discount" placeholder="请输入" />
            </NFormItem>
            <NButton
            :disabled=" computeDisable|| computedButtonDisableBecauseOfHaveDiscountContent || chatSendDisable"


             type="info" size="large" @click="handleSubmit">生成促活文案</NButton>
        </NForm>
    </div>
</template>

<style scoped lang="less"></style>