<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { rejectRegistration } from '@/api/chat'

const route = useRoute()

const token = route.query.token
const title = ref('拒绝用户注册')

onMounted(() => {
  console.log('mounted')
  rejectRegistration(token).then((res) => {
    console.log(res)
    title.value = '拒绝用户注册成功'
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
