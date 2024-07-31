<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { approveRegistration } from '@/api/chat'

const title = ref('批注用户注册')
const route = useRoute()

const token = route.query.token
onMounted(() => {
  console.log('mounted')
  approveRegistration(token).then((res) => {
    console.log(res)
    title.value = '批注用户注册成功'
  }).catch((err) => {
    console.log(err)
  }).finally(() => {
    console.log('finally')
  })
})
</script>

<template>
  <h1 class="header">
    {{ title }}
  </h1>
</template>

<style lang="less" scoped>
    .header{
        color: red;
    }
</style>
