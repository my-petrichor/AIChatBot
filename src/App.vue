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

.n-tabs-tab__label {
  color: black !important; /* Force the color to black */
}
.n-tabs-tab--active .n-tabs-tab__label {
  color: white !important; /* Force the color to black */
}

.n-input{
 background-color:  rgba(245, 247, 250, 1) !important;
 border-radius: 4px !important;
 padding-left: 10px !important;
}

.n-input__placeholder span{
  color:rgba(188, 195, 204, 1);
  font-size: 16px;
}

.n-tabs-rail{
  box-shadow: 0px 3px 14px 1px rgba(9, 9, 87, 0.16) !important;
}
</style>
