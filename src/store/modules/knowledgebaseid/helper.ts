import { ss } from '@/utils/storage'

const LOCAL_NAME = 'idStorage'

export function defaultState(): Chat.IdState {
    return {
      knowledgeid: [],
      knowledgeidInself: [],
    }
    // return getLocalState()
  }

export function getLocalState(): Chat.IdState {
    const localState = ss.get(LOCAL_NAME)
    return { ...defaultState(), ...localState }
  }
  
  export function setLocalState(state: Chat.IdState) {
     ss.set(LOCAL_NAME, state)
  }