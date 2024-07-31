<script setup lang='ts'>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useChatStore, useUserStore } from '@/store'
const Login = defineAsyncComponent(() => import('@/components/common/Login/index.vue'))
const userStore = useUserStore()
const chatStore = useChatStore()

const userInfo = computed(() => userStore.userInfo)
const accessToken = computed(() => userStore.accessToken)
const loginModalVisible = ref(false);
const logout = () => {
  userStore.setLoginState(false)
  userStore.updateUserInfo({
    name: ''
  })
  userStore.setAccessToken('')
  chatStore.setModelInKB('')
}
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <div class="mr-2 min-w-0 ml-2">
      <h1 class="overflow-hidden font-bold  text-ellipsis whitespace-nowrap"
      style="font-size: 1rem;line-height: 2rem;"
      >
        DocNotes 
      </h1>
    </div>
    <template v-if="accessToken">
      <div class="mr-2">
        {{ userInfo.name }}
      </div>
      <div class="text-light-blue-500 login-link" @click="logout">
        退出登录
      </div>
    </template>
    <template v-else>
      <div class="text-light-blue-500 login-link" @click="loginModalVisible = true">
        请登录
      </div>
    </template>
    <Login v-if="loginModalVisible" v-model:visible="loginModalVisible" />
  </div>
</template>
