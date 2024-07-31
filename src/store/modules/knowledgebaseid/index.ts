import { defineStore } from 'pinia'
import {setLocalState,getLocalState } from './helper'

export const idStore = defineStore('idStore', {
  state: (): { knowledgeid: any[],knowledgeidInself:any[] } => {
    // return {
    //   // knowledgeid: 'samples',
    //   knowledgeid: [],
    //   knowledgeidInself: [],
    // }
    return getLocalState()
  },
  actions: {
    setKnowledgeid(value: any[]){
      this.knowledgeid = value
      this.recordState()
    },
    setKnowledgeidInself(value: any[]){
      this.knowledgeidInself = value
      this.recordState()
    },
    recordState() {
      setLocalState(this.$state)
    },
  }
})