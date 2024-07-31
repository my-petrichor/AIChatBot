<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NModal, useMessage } from 'naive-ui'
import { PostLogin } from '@/api/chat'
import { useUserStore } from '@/store'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const loginForm = ref({
  username: '1',
  password: '2',
})
const message = useMessage()

const loginRules = ref({
  username: [{ required: true, message: 'Please enter your username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter your password', trigger: 'blur' }],
})

const loginFormRef = ref<any>(null)
const userStore = useUserStore()

const closeLoginModal = () => {
  emit('update:visible', false) // Use emit to update the parent component's "visible" prop
  // Reset the login form when the modal is closed
  loginForm.value.username = ''
  loginForm.value.password = ''
  // Reset the form validation status
  loginFormRef.value?.resetValidation()
}

const login = () => {
  // Perform login logic here
  // You can access the form data using loginForm.value.username and loginForm.value.password
  PostLogin(`grant_type=&username=${loginForm.value.username}&password=${loginForm.value.password}&scope=&client_id=&client_secret=`).then((res) => {
    let access_token
    let name
    // After a successful login, close the modal
    switch (res.data.code) {
      case 200:
        access_token = res.data.data.access_token
        name = res.data.data.username
        userStore.setLoginState(true)
        userStore.updateUserInfo({
          name,
        })
        userStore.setAccessToken(access_token)
        closeLoginModal()
        break
      case 401:
      default:
        message.error(res.data.msg)
        break
    }
  }).catch((err) => {
    console.log(err)
    if (err === 401)
      message.error('401,请重新登录')
    else
      message.error(`Login fail : ${err.detail[0].msg}`)
  })
}
const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})
</script>

<template>
  <NModal v-model:show="show" title="登录" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
    <NForm ref="loginForm" :model="loginForm" :rules="loginRules">
      <NFormItem label="用户名" prop="username">
        <NInput v-model:value="loginForm.username" />
      </NFormItem>
      <NFormItem label="密码" prop="password">
        <NInput v-model:value="loginForm.password" type="password" />
      </NFormItem>
    </NForm>
    <template #footer>
      <div class="flex justify-end">
        <NButton style="" @click="login">
          登录
        </NButton>
        <NButton style="margin-left: 5px;" class="ml-2" @click="closeLoginModal">
          取消
        </NButton>
      </div>
    </template>
  </NModal>
</template>
