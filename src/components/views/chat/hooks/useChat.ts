import { useChatStore } from '@/store'

export function useChat() {
  const chatStore = useChatStore()

  const getChatByUuidAndIndex = (uuid: number, index: number) => {
    return chatStore.getChatByUuidAndIndex(uuid, index)
  }

  const addChat = (uuid: number | string, chat: Chat.Chat) => {
    chatStore.addChatByUuid(uuid, chat)
  }
  
  
  const updateChat = (uuid: number | string, index: number, chat: Chat.Chat) => {
    chatStore.updateChatByUuid(uuid, index, chat)
  }

  const updateChatSome = (uuid: number | string, index: number, chat: Partial<Chat.Chat>) => {
    chatStore.updateChatSomeByUuid(uuid, index, chat)
  }

  const updateWholeChatByUuid = (uuid: number | string, chat: Chat.Chat[]) => {
    chatStore.updateWholeChatByUuid(uuid, chat)
  }

  return {
    addChat,
    updateChat,
    updateChatSome,
    getChatByUuidAndIndex,
    updateWholeChatByUuid,
  }
}
