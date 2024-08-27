<script setup lang="ts">
import { ref, onMounted, reactive, computed,watch } from 'vue'
import {
    NButton, NForm, NFormItem, NIcon, NInput,  NSelect,useMessage
} from 'naive-ui'
import { useRouter } from "vue-router"
import { ArrowBackIosFilled } from '@vicons/material'
import { useStyledChatStore } from '@/store/modules/styledChat'
import { getMarketingWritingListShopTypes, getMarketingWritingBrandOwnerList,postGenerateQueryPromptForMarketWriting } from '@/api/chat'

const styledChatStore = useStyledChatStore();
const router = useRouter()
const presetForm = ref({
    characterSetting: '',
    shoppingType: '',
    festival: '',
    platform: '',
    discount: '',
})
const options = [
    { label: '是', value: '1' },
    { label: '否', value: '0' },
]
const hasPromotionValue = ref('1')
const chatSendDisable = computed(() => styledChatStore.chatSendDisable)
const characterSettingList = ref<any>([])
const shoppingTypeList = ref<any>([])
// const message = useMessage()
const labelStyle = reactive({
    fontSize: "1em",
    fontWeight: "bold",
    color: "#0d1117",
})
// const { setChatSendDisable } = useStyledChatStore()
const computedButtonDisableBecauseOfHaveDiscountContent = computed(() => {
    if(hasPromotionValue.value === '0') {
        return false
    }else {
        return presetForm.value.discount ? false : true
    }
   
})
const handleSubmit = async () => {
    // if (!presetForm.value.characterSetting || !presetForm.value.discount) {
    //     message.error('请填写完整的会员信息')
    //     return
    // }
    await postGenerateQueryPromptForMarketWriting({
        brand_owner: presetForm.value.characterSetting,
        shop_type: presetForm.value.shoppingType,
        festival: presetForm.value.festival,
        platform: presetForm.value.platform,
        promotion: hasPromotionValue.value === '0' ? '' : presetForm.value.discount
    }).then((res: { data: { data: any } }) => {
        styledChatStore.triggerEvent({ type: 'addChat', data: { ...presetForm.value, prompt:res.data.data, type: 'marketingWriting' } });
    })

}

function goHome() {
    router.push('/')
}
watch(hasPromotionValue, (value) => {
    if(value === '0') {
        presetForm.value.discount = ''
    }
})
onMounted(async () => {
    getMarketingWritingBrandOwnerList().then((res: { data: { data: any[] } }) => {
        characterSettingList.value = res.data.data.map((item: any) => {
            return {
                label: item,
                value: item,
            }
        })
        presetForm.value.characterSetting = characterSettingList.value[0].value
    })
    getMarketingWritingListShopTypes().then((res: { data: { data: any[] } }) => {
        shoppingTypeList.value = res.data.data.map((item: any) => {
            return {
                label: item,
                value: item,
            }
        })
        presetForm.value.shoppingType = shoppingTypeList.value[0].value
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
            <!-- <NFormItem label="平台" label-width="auto" :label-style="labelStyle">
                <NInput v-model:value="presetForm.platform" placeholder="请输入" />
            </NFormItem> -->
<<<<<<< Updated upstream
            <NFormItem label="是否有优惠内容" label-width="auto" :label-style="labelStyle">
                <NSelect v-model:value="hasPromotionValue" :options="options" />
            </NFormItem>
=======
>>>>>>> Stashed changes
            <NFormItem label="优惠内容" label-width="auto" :label-style="labelStyle">
                <NInput 
                :disabled="hasPromotionValue === '0'"
                v-model:value="presetForm.discount" placeholder="请输入" />
            </NFormItem>
            <NFormItem>
                <NButton :disabled=" !presetForm.characterSetting || !presetForm.shoppingType || !presetForm.festival  || 
                computedButtonDisableBecauseOfHaveDiscountContent  || chatSendDisable " 
                type="info" size="large" @click="handleSubmit">生成</NButton>
            </NFormItem>
        </NForm>
    </div>
</template>

<style scoped lang="less"></style>