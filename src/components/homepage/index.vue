<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import knowledgePath from '@/assets/知识对话.png'
import file from '@/assets/文档对话.png'
import writing from '@/assets/对话写作.png'

const showModal = ref(false)
const Login = defineAsyncComponent(() => import('@/components/common/HomepageLogin/index.vue'))
const specialtiesArr = [
  {
    name: 'knowledge',
    img: knowledgePath,
  },
  {
    name: 'file',
    img: file,
  },
  {
    name: 'writing',
    img: writing,
  },
]
const clickButton = () => {
  showModal.value = true
}
</script>

<template>
  <div ref="index" class="index">
    <div class="header">
      <img src="@/assets/logo.png" alt="Logo">
    </div>
    <div class="middleContent">
      <div class="unit">
        <div class="title">
          <img src="@/assets/标题.png" alt="Title Image">
        </div>
        <div class="specialties">
          <img v-for="specialty in specialtiesArr" :key="specialty.name" :src="specialty.img">
        </div>
      </div>
    </div>
    <div class="flex-center">
      <div class="experience" @click="clickButton">
        立即体验
        <img src="@/assets/蒙版组6.png" alt="Group 8607">
      </div>
    </div>
    <div class="flex-center flex bottom">
      <div class="flex-center icp">
        <a target="_blank" href="https://beian.miit.gov.cn">京ICP备2023030175号-1</a>
      </div>
    </div>
    <Login v-if="showModal" v-model:visible="showModal" />
  </div>
</template>

<style scoped lang="less">
.index {
	width: 100%;
	padding-top: 25px;
	overflow: scroll;
	background-image: url('@/assets/首页bg.png');
	background-size: cover;
	background-position: center;
	height: 100vh;

	.header {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.headerName {
			color: white;
			font-weight: bold;
		}
	}

	.middleContent {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.unit {
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-start;
			display: flex;

			.title {
				margin-top: 138px;

				img {
					width: 888px;
					height: 235px;
				}
			}

			.specialties {
				justify-content: center;
				align-items: center;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				margin-top: 50px;
				padding-left: 60px;

				img {
					margin-right: 40px;
					margin-bottom: 10px;
					background-color: rgba(25, 52, 204, 1);
					border-radius: 10px;
				}
			}
		}
	}

	.flex-center {
		width: 100%;
		justify-content: center;
		align-items: center;
		display: flex;
	}

	.experience {
		cursor: pointer;
		justify-content: center;
		align-items: center;
		display: flex;
		margin-top: 197px;
		color: white;
		width: 300px;
		height: 60px;
		margin-bottom: 50px;
		justify-content: center;
		padding-top: 14px;
		padding-bottom: 14px;
		background-image: url('@/assets/组 8606.png');
		background-size: cover;
		background-position: center;
		font-size: 24px;

		img {
			margin-left: 10px;
		}
	}

	.bottom {
		color: white;
		flex-direction: column;
		margin-top: 50px;
		font-size: 20px;
	}
	.icp {
		color: #fff;
		margin-bottom: 18px;
	}
}
</style>
