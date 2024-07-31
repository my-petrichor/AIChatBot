<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useUserStore } from '@/store'
import { useAppStore, useChatStore } from '@/store'
import Header from '@/components/business/header/index.vue'
import Content from '@/components/business/content/index.vue'
import { useRouter } from 'vue-router';
const router = useRouter();
const appStore = useAppStore()
const userStore = useUserStore()
const { isMobile } = useBasicLayout()
const accessToken = computed(() => userStore.accessToken)
const currentThemeName = ref(appStore.theme)
const chatStore = useChatStore()
const collapsed = computed(() => appStore.siderCollapsed)
const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
    { 'pl-[260px]': !isMobile.value && !collapsed.value },
  ]
})
watch(appStore, () => {
  currentThemeName.value = appStore.theme
})

onMounted(() => {
  chatStore.setIsChatLoading(false)
  console.log("accessToken in layout comp",accessToken)
   if(!accessToken.value){
    router.replace('/');
   }
})
</script>

<template>
  <div class="h-full transition-all" :class="[isMobile ? 'p-0' : 'p-0']">
    <Header />
    <Content />
  </div>
</template>
