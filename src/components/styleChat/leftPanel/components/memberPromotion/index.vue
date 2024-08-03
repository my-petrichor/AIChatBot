<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import {useRouter} from "vue-router"
import iconBack from '@/assets/icon_back@2x.png'

const router = useRouter()
const presetForm = ref({
    company: '',
    name: '',
    phone: '',
    smsCode: '',
    reason: '',
})
const memberName = ref('')
const phoneNumber = ref('')
const remark = ref('')

const message = useMessage()

const handleSubmit = () => {
    if (!memberName.value || !phoneNumber.value) {
        message.error('请填写完整的会员信息')
        return
    }
    message.success('电子文案生成成功')
}

function goHome() {
    router.push('/')
}
</script>

<template>
    <div>
        <div class="flex justify-between flex-wrap">
            <div class="flex justify-start mb-1.5">
                <img class="icon mr-1.5 " src="@/assets/icon_back@2x.png">
                <span class="title">会员促活文案</span>
            </div>
        </div>
        <n-form label-placement="left" label-width="auto" require-mark-placement="right-hanging">
            <n-form-item label="会员姓名">
                <n-input v-model:value="memberName" placeholder="请输入" />
            </n-form-item>
            <n-form-item label="联系电话">
                <n-input v-model:value="phoneNumber" placeholder="请输入" />
            </n-form-item>
            <n-form-item label="备注信息">
                <n-input v-model:value="remark" type="textarea" placeholder="请输入" />
            </n-form-item>
            <n-form-item>
                <n-button type="primary" @click="handleSubmit">生成电子文案</n-button>
            </n-form-item>
        </n-form>
    </div>
</template>

<style scoped lang="less">

</style>