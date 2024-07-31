import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'

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
  // #5852D6
  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    if (isDark.value) {
      return {
        common: {
          NBoxShadowActive: 'red',

        },
        Radio: {
          boxShadowActive: '0 0 0 2px #5852D6',
          boxShadowHover: '0 0 0 2px #5852D6',
          boxShadowFocus: '0 0 0 2px #5852D6',
          dotColorActive: '#5852D6',
        },
        Dialog: {

        },
        Modal: {

        },
        Input: {
          borderHover: '0 0 0 2px #5852D6',
          borderFocus: '0 0 0 2px #5852D6',
          colorFocus: 'transparent',
          boxShadowFocus: '0 0 0 2px #5852D6',
        },
        Button: {
          textColorHover: '#5852D6',
          borderHover: '1px solid #5852D6',
          borderFocus: '1px solid #5852D6',
          textColorFocus: '#5852D6',
        },
        Tabs: {
          textColorHover: '#5852D6',
          borderHover: '1px solid #5852D6',
          borderFocus: '1px solid #5852D6',
          textColorFocus: '#5852D6',
          tabTextColorActiveBar: '#5852D6',
          tabTextColorActiveLine: '#5852D6',
          tabTextColorHoverLine: '#5852D6',
          barColor: '#5852D6',
          tabColorSegment: 'rgba(77, 70, 253, 1)',
        },
        Tabpane: {
          textColorHover: '#5852D6',
          borderHover: '1px solid #5852D6',
          borderFocus: '1px solid #5852D6',
          textColorFocus: '#5852D6',
        },
        FormItem: {
          lableHeight: '0px',
        },
        Upload: {
          draggerBorderHover: '2px dashed #5852D6',
          draggerBorderActive: '2px dashed #5852D6',
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
