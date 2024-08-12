import { defineStore } from "pinia";
import type { StyleChatState } from "./helper";
import { getLocalSetting, setLocalSetting } from "./helper";
import { store } from "@/store";

export const useStyledChatStore  = defineStore("styledChat-store", {
	state: (): StyleChatState => getLocalSetting(),
	actions: {
		setSiderCollapsed(collapsed: boolean) {
			this.siderCollapsed = collapsed;
			this.recordState();
		},
		setStyleInStyledChat(style: string) {
			this.styleInStyledChat = style;
			this.recordState();
		},
		triggerEvent(eventData:any) {
			console.log('triggerEvent', eventData);
			this.latestEvent = eventData;
			this.recordState();
		},
		setEnv(env: string) {
			this.env = env;
			this.recordState();
		},
		setCurrentChatStyle(currentChatStyle: string) {
			this.currentChatStyle = currentChatStyle;
			this.recordState();
		},
		setChatSendDisable(chatSendDisable: boolean) {
			this.chatSendDisable = chatSendDisable;
			this.recordState();
		},
		recordState() {
			setLocalSetting(this.$state);
		},
		setChatSendDisable(chatSendDisable: boolean) {
			this.chatSendDisable = chatSendDisable;
			this.recordState();
		},
		setLeftPanelType(leftPanelType: string) {
			this.leftPanelType = leftPanelType;
			this.recordState();
		}
	},
}) as any;
