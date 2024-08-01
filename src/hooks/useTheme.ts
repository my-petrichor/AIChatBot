import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'
import Header from '@/components/business/header/index.vue';

export function useTheme() {
  const appStore = useAppStore()

  const OsTheme = useOsTheme()

  const isDark = computed(() => {
    if (appStore.theme === 'auto')
      return OsTheme.value === 'dark'
    else
      return appStore.theme === 'dark'
  })

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })
  // rgba(74, 109, 255, 1)
  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    if (isDark.value) {
      return {
        common: {
          NBoxShadowActive: 'red',

        },
        Radio: {
          boxShadowActive: '0 0 0 2px rgba(74, 109, 255, 1)',
          boxShadowHover: '0 0 0 2px rgba(74, 109, 255, 1)',
          boxShadowFocus: '0 0 0 2px rgba(74, 109, 255, 1)',
          dotColorActive: 'rgba(74, 109, 255, 1)',
        },
        Dialog: {

        },
        Modal: {
          titleTextColor: 'rgba(74, 109, 255, 1)',
          closeColor: 'rgba(74, 109, 255, 1)',
        },
        Card: {
          titleTextColor: 'Black',
          titleFontSizeHuge: '32px',
        },
        Input: {
          // borderHover: '0 0 0 2px rgba(74, 109, 255, 1)',
          borderHover: '1px solid rgba(77, 80, 253, 1)',
          borderFocus: '1px solid  rgba(77, 80, 253, 1)',
          colorFocus: 'transparent',
          boxShadowFocus: '1px solid  rgba(77, 80, 253, 1)',
          backgroundColor: 'rgba(245, 247, 250, 1)',
          textColor: 'black',
        },
        Button: {
          textColorHover: 'rgba(74, 109, 255, 1)',
          borderHover: '1px solid rgba(74, 109, 255, 1)',
          borderFocus: '1px solid rgba(74, 109, 255, 1)',
          textColorFocus: 'rgba(74, 109, 255, 1)',
        },
        Tabs: {
          // textColorHover: 'rgba(74, 109, 255, 1)',
          borderHover: '1px solid rgba(74, 109, 255, 1)',
          borderFocus: '1px solid rgba(74, 109, 255, 1)',
          textColorFocus: 'rgba(74, 109, 255, 1)',
          paneTextColor:"black",
          tabTextColorCard: 'black',
          tabTextColorActiveBar: 'rgba(74, 109, 255, 1)',
          tabTextColorActiveLine: 'rgba(74, 109, 255, 1)',
          tabTextColorHoverLine: 'rgba(74, 109, 255, 1)',
          barColor: 'rgba(74, 109, 255, 1)',
          tabColorSegment: 'rgba(77, 70, 253, 1)',
        },
        Tabpane: {
          textColorHover: 'rgba(74, 109, 255, 1)',
          borderHover: '1px solid rgba(74, 109, 255, 1)',
          borderFocus: '1px solid rgba(74, 109, 255, 1)',
          textColorFocus: 'rgba(74, 109, 255, 1)',
        },
        FormItem: {
          lableHeight: '0px',
        },
        Upload: {
          draggerBorderHover: '2px dashed rgba(74, 109, 255, 1)',
          draggerBorderActive: '2px dashed rgba(74, 109, 255, 1)',
        },
        Split: {
          resizableTriggerColorHover: 'rgba(9,9,87,0.16)',
          // resizableTriggerColor: 'rgba(74, 109, 255, 1)',
        },
      }
    }
    return {
      common: {
        primaryColor: '#EC5E42',
        primaryColorHover: '#CF523A',
        primaryColorPressed: '#963C2A',
      },
    }
  })

  watch(
    () => isDark.value,
    (dark) => {
      if (dark)
        document.documentElement.classList.add('dark')
      else
        document.documentElement.classList.remove('dark')
    },
    { immediate: true },
  )

  return { theme, themeOverrides }
}
