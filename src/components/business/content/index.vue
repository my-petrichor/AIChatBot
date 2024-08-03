<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'
import {
  NSplit,
} from 'naive-ui'
// import { SwapHorizontal as SwapHorizontalIcon } from '@vicons/ionicons5'
// import Chat from '@/components/views/chat/index.vue'


import Chat from '@/components/styleChat/styledChat/index.vue'
import LeftPanel from '@/components/styleChat/leftPanel/index.vue'
import MemberPromotion from '@/components/styleChat/leftPanel/components/memberPromotion/index.vue'
import { useChatStore } from '@/store'
const leftSide = ref(null)
const content = ref(null)
const chatStore = useChatStore()
const defaultModel = 'ChatGLM-6b'
onBeforeMount(() => {
  chatStore.setChatMode(1)
})
onMounted(async () => {
  chatStore.setSelectedModel(defaultModel)
})
</script>

<template>
  <div ref="content" class="content">
    <NSplit
    direction="horizontal"
    style="height: calc(100% )"
    :default-size="0.2"
    :resize-trigger-size="16"
    :min="0.2"
    :max="0.5"
  >
    <template #1 >
      <div ref="leftSide" class="leftSide"  style="overflow-y: scroll;overflow-x:scroll">
          <MemberPromotion />
      </div>
    </template>
    <template #2>
      <div class="middleContent">
      <Chat id="chat" ref="chatRef" class="chat" />
    </div>
    </template>
    <template #resize-trigger >
    </template>
  </NSplit>
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
  background-color:rgba(255, 255, 255, 1);
  border-top: 1px solid rgba(220, 224, 228, 1);
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
   background-color: rgba(255, 255, 255, 1);
    margin: 4px 0px 4px 4px;
    padding: 20px;
    height:100%;
    // box-shadow: 0px 3px 14px 1px rgba(9,9,87,0.16);
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
    // background: black;
    background: rgba(245, 247, 253, 1);
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    height: 100%;
    margin: 0px 4px 4px 0px;
    height: calc(100% - 8px);
    overflow: hidden;
    box-shadow: -20px 0px 14px 1px rgba(9,9,87,0.16);
    margin-left: 1px;
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
