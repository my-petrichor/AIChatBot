<script setup lang="ts">
import { defineAsyncComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, useUserStore, useStyledChatStore } from '@/store'

const showModal = ref(false)
const isLogin = computed(() => userStore.isLogin)
const router = useRouter()
const Login = defineAsyncComponent(() => import('@/components/common/HomepageLogin/index.vue'))
const userStore = useUserStore()
const { setLeftPanelType } = useStyledChatStore()

// TODO: 根据点击icon设置leftPanelType
// setLeftPanelType("MemberPromotion")  // 会员促活文案
// setLeftPanelType("MarketingWriting") // 营销写作

const onClick = (name) => {
	// console.log("onClick",name)
	router.push({
		name: name,
	})
}

const clickButton = () => {
	if (isLogin.value) {
		userStore.setAccessToken('')
		userStore.setLoginState(false)
	} else {
		showModal.value = true
	}
}

</script>

<template>
	<div ref="index" class="index">
		<div class="header">
			<div class="headerUnit">
				<div class="headerLeft">
					<img src="@/assets/logo black.png" alt="Logo">
				</div>
				<div class="headerRight">
					<div class="userName">{{ isLogin ? userStore.userInfo.name : "" }}</div>
					<div class="button" @click="clickButton">
						<div class="buttonText">{{ isLogin ? '退出' : '登录' }}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="middleContent">
			<div class="unit">
				<div class="lingshouyingxiao">
					<div class='middleContentiImageLeft'>
						<img src="@/assets/AI零售营销.png" alt="AI零售营销">
					</div>
					<div class="middleContentiImage" @click="onClick('marketingWriting')">
						<div><img src="@/assets/AI营销写作.png" alt="AI营销写作"></div>
						<div class="middleContentImageText">AI营销写作</div>
					</div>
					<div class="rectangle">
						<img src="@/assets/矩形 42455.png">
					</div>
					<div class="middleContentiImage" @click="onClick('styleChange')">
						<div><img src="@/assets/AI风格改写.png" alt="AI风格改写"></div>
						<div class='middleContentImageText'>AI风格改写</div>
					</div>
					<div class="rectangle">
						<img src="@/assets/矩形 42455.png">
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/RPA自动运营账号.png" alt="RAP自动运营账号"></div>
						<div :style="{ fontSize: '20px' }">RAP自动运营账号</div>
					</div>
					<div class="rectangle">
						<img src="@/assets/矩形 42455.png">
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/营销决策，智能辅助.png" alt="营销决策，智能辅助"></div>
						<div :style="{ fontSize: '20px' }">营销决策，智能辅助</div>
					</div>
				</div>
				<div class="gukeyingxiao">
					<div class='middleContentiImageLeft'>
						<img src="@/assets/AI顾客营销.png" alt="AI顾客营销">
					</div>
					<div class="middleContentiImage" @click="onClick('memeberPromotionCopywriting')">
						<div><img src="@/assets/会员促活话术智能生成.png" alt="会员促活文案"></div>
						<div :style="{ fontSize: '20px' }">会员促活文案</div>
					</div>
					<div class="rectangle">
						<img src="@/assets/矩形 42455.png">
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/智能评论处理.png" alt="只能评论处理"></div>
						<div :style="{ fontSize: '20px' }">只能评论处理</div>
					</div>
					<div class="rectangle">
						<img src="@/assets/矩形 42455.png">
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/客诉智能回复.png" alt="客诉智能回复"></div>
						<div :style="{ fontSize: '20px' }">客诉智能回复</div>
					</div>
				</div>
				<div class="qiangjigongcheng">
					<div class='middleContentiImageLeft'>
						<img src="@/assets/强基工程.png" alt="强基工程">
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/AI随身专家.png" alt="AI随身专家"></div>
						<div :style="{ fontSize: '20px' }">AI随身专家</div>
					</div>
					<div class="rectangle">
						<img src="@/assets/矩形 42455.png">
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/智能培训.png" alt="智能培训"></div>
						<div :style="{ fontSize: '20px' }">智能培训</div>
					</div>
					<div class="rectangle">
						<img src="@/assets/矩形 42455.png">
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/智能督导.png" alt="智能督导"></div>
						<div :style="{ fontSize: '20px' }">智能督导</div>
					</div>
				</div>
			</div>
		</div>

		<div class="bottom">
			<div class="bottomUnit">
				<a class="icp" target="_blank" href="https://beian.miit.gov.cn">©2023xxxxxxxx｜京ICP备2023030175号</a>
			</div>
		</div>
		<Login v-if="showModal" v-model:visible="showModal" />
	</div>
</template>

<style scoped lang="less">
.index {
	width: 100%;
	overflow: scroll;
	background-image: url('@/assets/蒙版组 23.png');
	background-size: cover;
	background-position: center;
	height: 100vh;

	.header {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 0.83vh;

		.headerUnit {
			width: 62.5vw;
			display: flex;
			flex-direction: row;
			justify-content: space-between;

			.headerRight {
				display: flex;
				flex-direction: row;
				align-items: center;
			}
		}
	}

	.userName {
		width: 75px;
		height: 22px;
		font-family: PingFang SC, PingFang SC;
		font-weight: 400;
		font-size: 16px;
		color: #111111;
		text-align: left;
		font-style: normal;
		text-transform: none;
		margin-right: 0.52vw;
	}

	.button {
		cursor: pointer;
		justify-content: center;
		align-items: center;
		display: flex;
		width: 62px;
		height: 30px;
		border-radius: 4px 4px 4px 4px;
		border: 1px solid #4D50FD;

		.buttonText {
			width: 28px;
			height: 20px;
			font-family: PingFang SC, PingFang SC;
			font-weight: 400;
			font-size: 14px;
			color: #4D50FD;
			text-align: left;
			font-style: normal;
			text-transform: none;
		}
	}

	.middleContent {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 10vh;

		.unit {
			width: 62.5vw;
			height: 64.81vh;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-start;

			.rectangle {
				display: flex;
				flex-direction: column;
				justify-content: center;
			}

			.lingshouyingxiao {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: row;
			}

			.gukeyingxiao {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: row;
			}

			.qiangjigongcheng {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: row;
			}

			.middleContentiImageLeft {
				width: 18%;
				border-radius: 0px 0px 0px 0px;
			}

			.middleContentiImage {
				display: flex;
				flex-direction: column;
				align-items: center;
				cursor: pointer;
				width: 20.5%;

				.middleContentImageText {
					font-family: PingFang SC, PingFang SC;
					font-weight: 400;
					font-size: 20px;
					color: #111111;
					font-style: normal;
					text-transform: none;
				}
			}
		}
	}

	.bottom {
		width: 100%;
		margin-top: 17.68vh;
		display: flex;
		align-items: center;
		flex-direction: column;

		.bottomUnit {
			width: 62.5vw;
			display: flex;
			flex-direction: row;
			justify-content: center;

			.icp {
				font-family: PingFang SC, PingFang SC;
				font-weight: 400;
				font-size: 14px;
				color: rgba(0, 0, 0, 0.7);
				text-align: center;
				font-style: normal;
				text-transform: none;
			}
		}
	}
}
</style>
