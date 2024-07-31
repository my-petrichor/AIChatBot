import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'

export function defaultState(): Chat.ChatState {
// default uuid
  const uuid = ''
  return {
    active: uuid,
    usingContext: true,
    history: [{ uuid, title: 'New Chat', isEdit: false }],
    chat: [{ uuid, data: [] }],
    chatMode: 1,
    typeInKbChat: 1,
    modelInKB: 'ChatGLM-6b',
    knowledgeRepo: [],
    myFileList: [],
    selectedModel: 'ChatGLM-6b',
    quote: '',
    selectedQuery: '',
    isChatLoading: false,
  }
}

export function getLocalState(): Chat.ChatState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Chat.ChatState) {
  ss.set(LOCAL_NAME, state)
}
