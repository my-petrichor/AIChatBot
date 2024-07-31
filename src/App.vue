<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import '../app.less'
import { useAppStore } from '@/store/modules/app'

const { theme, themeOverrides } = useTheme()
const { language } = useLanguage()
const { setEnv } = useAppStore()
setEnv(process.env.NODE_ENV || 'production')
</script>

<template>
  <NConfigProvider class="h-full" :theme="theme" :theme-overrides="themeOverrides" :locale="language">
    <NaiveProvider>
      <RouterView />
    </NaiveProvider>
  </NConfigProvider>
</template>

<style>
* {
  font-family: PingFang SC-Bold, PingFang SC;
}

.icon24 {
  width: 24px;
  height: 24px;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}
</style>
