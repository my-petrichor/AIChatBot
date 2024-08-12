import {ss} from '@/utils/storage'

const LOCAL_NAME = 'styledChatSetting'

export type Theme = 'light' | 'dark' | 'auto'

export type Language = 'zh-CN' | 'zh-TW' | 'en-US' | 'ko-KR' | 'ru-RU'

export interface StyleChatState {
	siderCollapsed: boolean
	theme: Theme
	language: Language
	env: string
	currentChatStyle: string
	chatSendDisable: boolean
	leftPanelType: string
	latestEvent: any
	styleInStyledChat: string
}

export function defaultSetting(): StyleChatState {
	return {siderCollapsed: false, theme: 'dark', language: 'zh-CN', env: process.env.NODE_ENV || 'production',

		currentChatStyle: 'default', chatSendDisable: false, leftPanelType: 'MarketingWritinglarge',
		 latestEvent: null,
		styleInStyledChat: ''
	}
}

export function getLocalSetting(): StyleChatState {
	const localSetting: StyleChatState | undefined = ss.get(LOCAL_NAME)
	return {...defaultSetting(), ...localSetting}
}

export function setLocalSetting(setting: StyleChatState): void {
	ss.set(LOCAL_NAME, setting)
}
