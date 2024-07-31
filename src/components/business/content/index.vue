<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import Knowledge from '@/components/business/knowledge/index.vue'
import myFile from '@/components/business/myFile/index.vue'
import Chat from '@/components/views/chat/index.vue'
import RightPanel from '@/components/business/rightPanel/index.vue'
import { useAppStore, useChatStore } from '@/store'
const leftSide = ref(null)
const content = ref(null)
const rightPanelWidth = ref<any>(500)
const chatStore = useChatStore()
const appStore = useAppStore()
const siderCollapsed = computed(() => appStore.siderCollapsed)
const chatRef = ref<any>(null)
const defaultModel = 'ChatGLM-6b'
let contentWidth: number
const gridTemplateColumns = computed(() => {
  contentWidth = (content?.value as any)?.offsetWidth
  return rightPanelWidth.value >= 0.7 * contentWidth ? `${contentWidth * 0.1}px ${contentWidth * 0.2}px ${contentWidth * 0.7}px` : `300px ${contentWidth - 300 - rightPanelWidth.value}px ${rightPanelWidth.value}px`
})
const onDetailHeightUpdateHandler = (e: string) => {
  rightPanelWidth.value = e
}
onBeforeMount(() => {
  chatStore.setChatMode(1)
})
onMounted(async () => {
  chatStore.setSelectedModel(defaultModel)
})
</script>

<template>
  <div ref="content" class="content" :style="{ 'grid-template-columns': gridTemplateColumns, 'transition': 'grid-gap 0.5s ease-in-out' }">
    <div ref="leftSide" class="leftSide" :class="{ leftSideCollapsed: siderCollapsed }" style="overflow-y: scroll;overflow-x:scroll">
      <Knowledge />
      <myFile />
    </div>
    <div class="middleContent">
      <!-- <Detail
        v-if="currentChatMode === 2" id="detail" :style="{ height: currentDetailHeight }"
        @update:current-height="onDetailHeightUpdateHandler"
      /> -->
      <Chat id="chat" ref="chatRef" class="chat" />
    </div>
    <RightPanel :max-width="(contentWidth * 7) / 10" @update:current-width="onDetailHeightUpdateHandler" />
  </div>
</template>

<style lang="less">
a.custom-link {
  color: blue;
  /* Sets the text color to blue */
  text-decoration: underline;
  /* Adds an underline */
  cursor: pointer;
  /* Changes cursor on hover to indicate it's clickable */
}

.parent {
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid #000;
  user-select: none;
  background-color: white;
}

/* Hide the scrollbar in WebKit (Chrome, Safari) */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.content {
  height: calc(100% - 50px);
  width: 100%;
  display: grid;
  color: white;
  overflow: scroll;
  scrollbar-width: none;
  /* Firefox */
  scrollbar-color: transparent transparent;

  /* Firefox */
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    display: inline;
  }

  .arrowIcon {
    width: 14px;
    height: 14px;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
  }

  .title {
    font-size: 24px;
    font-family: PingFang SC-Medium, PingFang SC;
    font-weight: 500;
    color: #FFFFFF;
  }

  .seperator {
    width: 266px;
    height: 1px;
    background: #2E313C;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
  }

  // @media screen and (max-width: 768px) {
  //   .leftSide {
  //     margin-left: -300px !important;
  //     // display: none;
  //     transition: margin-left 0.5s ease-in-out;
  //   }
  // }
  .leftSideCollapsed {
    margin-left: -300px !important;
    transition: margin-left 0.5s ease-in-out;
  }

  .rightSideCollapsed {
    margin-right: -300px !important;
    transition: margin-left 0.5s ease-in-out;
  }

  .leftSide {
   background-color: black;
    margin: 4px 0px 4px 4px;
    padding: 20px;
    height: calc(100% - 8px);

    .selectedKnowledge {
      width: 266px;
      height: 50px;
      background: linear-gradient(270deg, #4D46FD 0%, #506BFF 100%);
      border-radius: 10px 10px 10px 10px;
      opacity: 1;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      color: #FFFFFF;
      line-height: 0px;
      padding: 10px;
      overflow: hidden;
    }

    .defaultKnowledge {
      width: 266px;
      height: 50px;
      border-radius: 10px 10px 10px 10px;
      opacity: 70%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      color: #FFFFFF;
      line-height: 0px;
      padding: 10px;
      overflow: hidden;
    }

    .defaultKnowledge:hover {
      background: #2E313C;
      opacity: 1;
    }
  }

  .middleContent {
    background: black;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    height: 100%;
    margin: 4px 4px 4px 0px;
    height: calc(100% - 8px);
    overflow: hidden;
  }

  .rightSide {
    min-width: 300px;
    height: calc(100% - 8px);
    background: #20232B;
    border-radius: 4px 4px 4px 4px;
    margin: 4px 4px 4px 0px;
    padding-left: 4px;
    padding-right: 4px;
    position: relative;
    overflow: hidden;

  }
}
</style>
