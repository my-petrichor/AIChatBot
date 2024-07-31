<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'
import { getUserProfile } from '@/api/chat'
const Login = defineAsyncComponent(() => import('@/components/common/Login/index.vue'))
const loginModalVisible = ref(false)
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const accessToken = computed(() => userStore.accessToken)
const siderCollapsed = computed(() => appStore.siderCollapsed)
const showCollapseIcon = ref(window.innerWidth <= 768)
const onResize = () => {
  showCollapseIcon.value = window.innerWidth <= 768
  if (window.innerWidth <= 768)
    appStore.setSiderCollapsed(true)

  else
    appStore.setSiderCollapsed(false)
}
const logout = () => {
  loginModalVisible.value = false
  userStore.setAccessToken('')
  userStore.setLoginState(false)
  router.replace('/')
}

const toggleSideBar = () => {
  appStore.setSiderCollapsed(!siderCollapsed.value)
}

const login = () => {
  loginModalVisible.value = true
  router.replace('/')
}
watch(accessToken, (value) => {
  if (value) {
    getUserProfile(value).then((res) => {
      userStore.updateUserInfo(res.data.data)
    })
  }
  else {
    userStore.resetUserInfo()
  }
})

onMounted(() => {
  if (accessToken.value) {
    getUserProfile(accessToken.value).then((res) => {
      userStore.updateUserInfo(res.data.data)
    })
  }
  else {
    userStore.resetUserInfo()
  }

  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  // Remove the resize event listener when the component is unmounted
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="header">
    <div class="title">
      <svg
        v-if="showCollapseIcon"
        :onclick="toggleSideBar"
        class="w-5 mr-2"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 448 512"
      >
        <path
          d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
          fill="currentColor"
        />
      </svg>
      <span>DocNotes</span>
    </div>

    <div class="right-div">
      <div v-if="accessToken">
        {{ userStore.userInfo.name }}
      </div>
      <div v-if="!accessToken" class="login" @click="login">
        登录
      </div>
      <div v-if="accessToken" class="login" @click="logout">
        登出
      </div>
    </div>
  </div>
  <Login v-if="loginModalVisible" v-model:visible="loginModalVisible" />
</template>

<style scoped lang="less">
.header {
  height: 50px;
  // background: #20232B;
  background: rgba(255, 255, 255, 1);
  width: 100%;
  padding: 10px 20px 10px 20px;
  display: flex;
  justify-content: space-between;

  .title {
    font-size: 24px;
    font-family: Futura-Bold, Futura;
    font-weight: bold;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .right-div {
    display: flex;
    flex-direction: row;
    color: #eeeff2;
    align-items: center;
    justify-content: center;

    .login {
      width: 62px;
      height: 30px;
      margin-left: 20px;
      opacity: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px 10px 10px 10px;
      opacity: 1;
      border: 1px solid #607FFF;
      font-weight: 400;
      color: #607FFF;
      line-height: 0px;
      -webkit-background-clip: text;
      background-clip: text;
    }

    .login:hover {
      background: rgba(96, 127, 255, 0.2);
    }
  }
}
</style>
