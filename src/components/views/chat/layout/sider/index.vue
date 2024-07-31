<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { NButton, NLayoutSider, NButtonGroup } from 'naive-ui'
import List from './List.vue'
import Knowledge from './knowledge-base/index.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import './index.less'
// import { useTheme } from '@/hooks/useTheme'
import { useUserStore } from '@/store'
const Login = defineAsyncComponent(() => import('@/components/common/Login/index.vue'))
const appStore = useAppStore()
const chatStore = useChatStore()
const userStore = useUserStore()

const loginModalVisible = ref(false);
const { isMobile } = useBasicLayout()
// const { theme } = useTheme()
// const menu = ref(1)

const collapsed = computed(() => appStore.siderCollapsed)

const currentThemeName = ref(appStore.theme)

const currentChatMode = ref(chatStore.chatMode)

function handleAdd() {
  // menu.value = 1
  chatStore.setChatMode(1)
  chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

const songs = [
  {
    value: 1,
    label: '会话',
  },
  {
    value: 2,
    label: '历史对话问答',
  },
  {
    value: 3,
    label: '知识库',
  },
]



const clickButton = (value: number) => {
  chatStore.setChatMode(value)
  if (value === 2 && !accessToken.value) {
    loginModalVisible.value = true
    return
  }
  if (value === 3) {
    chatStore.setTypeInKbChat(1)
  }
}

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
watch(appStore, (newTheme) => {
  currentThemeName.value = appStore.theme
})

watch(chatStore, () => {
  currentChatMode.value = chatStore.chatMode
})

const accessToken = computed(() => userStore.accessToken)

onMounted(() => {
  chatStore.setChatMode(1)
})

</script>

<template>
  <!-- :style="getMobileClass" -->
  <NLayoutSider :collapsed="collapsed" :collapsed-width="0" :width="260" :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform" position="absolute" bordered
    :style="[getMobileClass, { 'background-color': currentThemeName === 'dark' ? 'rgb(0 0 0 / var(--tw-bg-opacity))' : 'inherit' }]"
    @update-collapsed="handleUpdateCollapsed">
    <Footer />
    <div class="flex flex-col h-full " :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="flex justify-between w-full">
          <NButtonGroup class="flex justify-between w-full" name="radiobuttongroup1"
            style=" align-items: center !important;" size="large" vertical :value="currentChatMode">
            <NButton @click="clickButton(song.value)" v-for="song in songs" :key="song.value" :value="song.value"
              :label="song.label" size="large" style="margin-bottom: 2px !important; width: 80% !important;   
" :type="currentChatMode === song.value ? 'primary' : 'default'">{{
  song.label
}}

            </NButton>
          </NButtonGroup>
        </div>

        <!-- 知识库界面 -->
        <div v-if="currentChatMode === 3">
          <div class="p-4">
            <Knowledge />
          </div>
        </div>
        <!-- 会话界面 -->
        <!-- <div v-if="currentChatMode === 1"> -->
        <div class="p-4">
          <NButton block @click="handleAdd">
            新建聊天
          </NButton>
        </div>
        <div class="p-2">
          <List />
        </div>

        <!-- </div> -->
      </main>
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 w-full h-full bg-black/40" @click="handleUpdateCollapsed" />
  </template>
  <!-- <PromptStore v-model:visible="show" /> -->
  <Login v-if="loginModalVisible" v-model:visible="loginModalVisible" />
</template>
