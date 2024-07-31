import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar?: string
  name?: string
  description?: string
  models?: any[]
  pub_kbs?: any[]
}

export interface UserState {
  userInfo: UserInfo
  isLogin: any
  accessToken: string
  models: any[]
}

export function defaultSetting(): UserState {
  return {
    isLogin: false,
    userInfo: {
      // avatar: 'https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.png',
      // name: 'user1',
      // description: 'Star on <a href="https://github.com/Chanzhaoyu/chatgpt-bot" class="text-blue-500" target="_blank" >GitHub</a>',
    },
    accessToken: '',
    models: [],
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
