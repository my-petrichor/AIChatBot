<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { NDatePicker, NRadio } from 'naive-ui'
// import { getfilelist } from '@/api/chat'
import expandIconPath from '@/assets/icon_展开@2x.png'
import collapseIconPath from '@/assets/icon_收起@2x.png'
import { useChatStore, useUserStore } from '@/store'
import { kb_EN_CN_convertion } from '@/consts/const'
import { debounce } from '@/utils/functions/debounce'
// save to chat store
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const knowledgeRepo = ref<any>([])
const expandIcon = expandIconPath // Replace with the correct path to the expand icon
const collapseIcon = collapseIconPath // Replace with the correct path to the collapse icon
const now = new Date()
const chatStore = useChatStore()
const filteredKnowledgeRepo = computed(() => knowledgeRepo.value?.filter((e: any) => (e.name !== '')))
const clickKnowledge = (index: number) => {
  if (chatStore.isChatLoading)
    return
  chatStore.setChatMode(1)
  chatStore.setMyFileList(
    // all selected in my fileList and isSelected in the children of the fileList should be false
    chatStore.myFileList.map((ele: any) => ({
      ...ele,
      selected: false,

      children: ele.children.map((child: any) => ({
        ...child,
        isSelected: false,

      })),
    })),
  )
  knowledgeRepo.value = knowledgeRepo.value.map((ele: any, i: number) => ({
    ...ele,
    selected: i === index,
    isExpanded: i === index ? !ele.isExpanded : false,
  }))
}
const debounceClickKnowledge = debounce(clickKnowledge, 500)
const handleChange = (e: Event, index: number, childIndex: number) => {
  knowledgeRepo.value = knowledgeRepo.value.map((ele: any, i: number) => ({
    ...ele,
    children: i === index
      ? ele.children.map((child: any, childI: number) => ({
        ...child,
        checked: !!(i === index && childI === childIndex),
      }))
      : ele.children,
  }))
}
watch(() => knowledgeRepo.value, (newVal, oldVal) => {
  chatStore.setKnowledgeRepo(newVal)
}, {
  deep: true,
})

watch(() => chatStore.knowledgeRepo, (newVal, oldVal) => {
  knowledgeRepo.value = newVal
}, {
  deep: true,
})

watch(() => chatStore.chatMode, (newVal, oldVal) => {
  if (newVal !== 1) {
    knowledgeRepo.value = knowledgeRepo.value.map((ele: any) => ({
      ...ele,
      selected: false,
      isExpanded: false,
    }))
  }
}, { deep: true })

watch(userInfo, (newVal) => {
  if (newVal) {
    knowledgeRepo.value = newVal.pub_kbs?.map((ele: any, index: number) => ({
      name: ele,
      selected: index === 0,
      isExpanded: index === 0,
      children: [
        {
          value: 'all',
          name: '全部',
          checked: true,
        },
        {
          value: 'scope',
          name: '自定义时间范围',
          checked: false,
          startDate: new Date(now.getFullYear() - 1, now.getMonth(), 1).getTime(),
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
        },
      ],
    }))
  }
}, { deep: true })

// watch filteredKnowledgeRepo and print the value
watch(filteredKnowledgeRepo, (newVal) => {
  console.log(newVal)
}, { deep: true })

onMounted(async () => {
  // knowledgeRepo.value = (await getfilelist('')).data.data.map((ele: any, index: number) => ({
  //   name: ele,
  //   selected: index === 0,
  //   isExpanded: index === 0,
  //   children: [
  //     {
  //       value: 'all',
  //       name: '全部',
  //       checked: true,
  //     },
  //     {
  //       value: 'scope',
  //       name: '自定义时间范围',
  //       checked: false,
  //       startDate: new Date(now.getFullYear() - 1, now.getMonth(), 1).getTime(),
  //       endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
  //     },
  //   ],
  // }))
})
</script>

<template>
  <div style="margin-bottom: 30px;">
    <div class="flex">
      <img class="icon mr-1.5" src="@/assets/icon_知识库@2x.png">
      <span class="title">知识库</span>
    </div>
    <div class="seperator mt-4 mb-4" />
    <div>
      <ul>
        <li
          v-for="(item, index) in filteredKnowledgeRepo"
          :key="item.name"
          :title="item.name"
        >
          <div
            class="mb-1" :class="{ selectedKnowledge: item.selected, defaultKnowledge: !item.selected }"
            @click="debounceClickKnowledge(index)"
          >
            <img class="arrowIcon" :src="item.isExpanded ? expandIcon : collapseIcon">
            <span class="ml-1">{{ kb_EN_CN_convertion[item.name] || item.name }}</span>
          </div>
          <div v-if="item.isExpanded" class="mb-2">
            <NSpace
              v-for="(child, childIndex) in item.children" :key="childIndex" class="flex"
              style="flex-direction: column !important;"
            >
              <NRadio
                class="pl-6 mt-4" :checked="child.checked" :value="child.value" name="basic-demo"
                @change="handleChange($event, index, childIndex)"
              >
                {{ child.name }}
              </NRadio>
              <div v-if="child.value === 'scope'" class="pl-10 flex mt-2">
                <NDatePicker v-model:value="child.startDate" type="month" clearable class="mr-1" style="width: 150px;" />
                -
                <NDatePicker v-model:value="child.endDate" type="month" clearable class="ml-1" style="width: 150px;" />
              </div>
            </NSpace>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
