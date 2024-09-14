<script setup lang="ts">
import { defineAsyncComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'

const showModal = ref(false)
const isLogin = computed(() => userStore.isLogin)
const router = useRouter()
const Login = defineAsyncComponent(() => import('@/components/common/HomepageLogin/index.vue'))
const userStore = useUserStore()

const onClick = (name) => {
	
	router.push('chat/' + name)
	

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
					<div v-if="isLogin" class="buttonLogin" @click="clickButton">
						<div class="buttonTextLogin">{{ isLogin ? '退出' : '登录' }}</div>
					</div>
					<div v-else class="buttonLogout" @click="clickButton">
						<div class="buttonTextLogout">{{ isLogin ? '退出' : '登录' }}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="middleContent">
			<div class="unit">
				<div class="lingshouyingxiao">
					<div class='jianbian'></div>
					<div class="lingshouyingxiaoValue">
						<div class='middleContentiImageLeft'>
							<img src="@/assets/AI零售营销.png" alt="AI零售营销">
						</div>
						<!-- <div v-if="isLogin" class="middleContentiImage" @click="onClick('marketingWriting')">
							<div class="middleContentImageLogin"><img src="@/assets/AI营销写作.png" alt="AI营销写作"></div>
							<div class="middleContentImageTextLogin">AI营销写作</div>
						</div>
						<div v-else class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img  src="@/assets/AI营销写作.png" alt="AI营销写作"></div>
							<div class="middleContentImageTextUnLogin">AI营销写作</div>
						</div> -->
						<div class="middleContentiImage" @click="onClick('marketingWriting')">
							<div class="middleContentImageLogin"><img src="@/assets/AI营销写作.png" alt="AI营销写作"></div>
							<div class="middleContentImageTextLogin">AI营销写作</div>
						</div>
						<div class="rectangle">
							<img src="@/assets/矩形 42455.png">
						</div>
						<!-- <div v-if="isLogin" class="middleContentiImage" @click="onClick('selectStyle')">
							<div class="middleContentImageLogin"><img src="@/assets/AI风格改写.png" alt="AI风格改写"></div>
							<div class='middleContentImageTextLogin'>AI风格改写</div>
						</div>
						<div v-else class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/AI风格改写.png" alt="AI风格改写"></div>
							<div class="middleContentImageTextUnLogin">AI风格改写</div>
						</div> -->
						<div class="middleContentiImage" @click="onClick('selectStyle')">
							<div class="middleContentImageLogin"><img src="@/assets/AI风格改写.png" alt="AI风格改写"></div>
							<div class='middleContentImageTextLogin'>AI风格改写</div>
						</div>
						<div class="rectangle">
							<img src="@/assets/矩形 42455.png">
						</div>
						<div class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/RPA自动运营账号.png" alt="RPA自动运营账号"></div>
							<div class="middleContentImageTextUnLogin">RPA自动运营账号</div>
						</div>
						<div class="rectangle">
							<img src="@/assets/矩形 42455.png">
						</div>
						<div class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/营销决策，智能辅助.png" alt="营销决策，智能辅助"></div>
							<div class="middleContentImageTextUnLogin">营销决策，智能辅助</div>
						</div>
					</div>
				</div>
				<div class="gukeyingxiao">
					<div style="height: 8.2vh"></div>
					<div class='jianbian'></div>
					<div class="gukeyingxiaoValue">
						<div class='middleContentiImageLeft'>
							<img src="@/assets/AI顾客营销.png" alt="AI顾客营销">
						</div>
						<!-- <div v-if="isLogin" class="middleContentiImage" @click="onClick('memberPromotion')">
							<div class="middleContentImageLogin"><img src="@/assets/会员促活话术智能生成.png" alt="会员促活文案"></div>
							<div class="middleContentImageTextLogin">会员促活文案</div>
						</div>
						<div v-else class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/会员促活话术智能生成.png" alt="会员促活文案"></div>
							<div class="middleContentImageTextUnLogin">会员促活文案</div>
						</div> -->
						<div class="middleContentiImage" @click="onClick('memberPromotion')">
							<div class="middleContentImageLogin"><img src="@/assets/会员促活话术智能生成.png" alt="会员促活文案"></div>
							<div class="middleContentImageTextLogin">会员促活文案</div>
						</div>
						<div class="rectangle">
							<img src="@/assets/矩形 42455.png">
						</div>
						<div class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/智能评论处理.png" alt="智能评论处理"></div>
							<div class="middleContentImageTextUnLogin">智能评论处理</div>
						</div>
						<div class="rectangle">
							<img src="@/assets/矩形 42455.png">
						</div>
						<div class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/客诉智能回复.png" alt="客诉智能回复"></div>
							<div class="middleContentImageTextUnLogin">客诉智能回复</div>
						</div>
					</div>
				</div>
				<div class="qiangjigongcheng">
					<div style="height: 8.2vh"></div>
					<div class='jianbian'></div>
					<div class="qiangjigongchengValue">
						<div class='middleContentiImageLeft'>
							<img src="@/assets/强基工程.png" alt="强基工程">
						</div>
						<div class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/AI随身专家.png" alt="AI随身专家"></div>
							<div class="middleContentImageTextUnLogin">AI随身专家</div>
						</div>
						<div class="rectangle">
							<img src="@/assets/矩形 42455.png">
						</div>
						<div class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/智能培训.png" alt="智能培训"></div>
							<div class="middleContentImageTextUnLogin">智能培训</div>
						</div>
						<div class="rectangle">
							<img src="@/assets/矩形 42455.png">
						</div>
						<div class="middleContentiImage">
							<div class="middleContentImageUnLogin"><img src="@/assets/智能督导.png" alt="智能督导"></div>
							<div class="middleContentImageTextUnLogin">智能督导</div>
						</div>
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

	.buttonLogin {
		cursor: pointer;
		justify-content: center;
		align-items: center;
		display: flex;
		width: 62px;
		height: 30px;
		border-radius: 4px 4px 4px 4px;
		border: 1px solid #4D50FD;

		.buttonTextLogin {
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

	.buttonLogout {
		cursor: pointer;
		justify-content: center;
		align-items: center;
		display: flex;
		width: 62px;
		height: 30px;
		background: linear-gradient( 270deg, #4D46FD 0%, #506BFF 100%);
		border-radius: 4px 4px 4px 4px;
		

		.buttonTextLogout {
			width: 28px;
			height: 20px;
			font-family: PingFang SC, PingFang SC;
			font-weight: 400;
			font-size: 14px;
			color: #FFFFFF;
			text-align: left;
			font-style: normal;
			text-transform: none;
		}
	}

	.middleContent {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 2vh;

		.unit {
			width: 62.5vw;
			height: 73vh;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
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
				flex-direction: column;
				height: 21vh;

				.lingshouyingxiaoValue{
					display: flex;
					justify-content: flex-start;
					flex-direction: row;
				}
			}

			.gukeyingxiao {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: column;
				height: 26.8vh;

				.gukeyingxiaoValue{
					display: flex;
					justify-content: flex-start;
					flex-direction: row;
				}
			}

			.qiangjigongcheng {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: column;
				height: 26.8vh;

				.qiangjigongchengValue{
					display: flex;
					justify-content: flex-start;
					flex-direction: row;
				}
			}

			.jianbian{
				height: 8vh;
				background: radial-gradient(ellipse farthest-side at 50% -4%, #FFFFFF 0%, rgba(255,255,255,0) 100%);
				opacity: 0.7;
			}


			.middleContentiImage {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				width: 20.5%;

				.middleContentImageLogin {
					cursor: pointer;
				}

				.middleContentImageUnLogin {
					opacity: 0.3;
				}
				
				.middleContentImageTextLogin{
					font-family: PingFang SC, PingFang SC;
					font-weight: 400;
					font-size: 20px;
					font-style: normal;
					text-transform: none;
					color: black;
					cursor: pointer;
				}

				.middleContentImageTextUnLogin{
					font-family: PingFang SC, PingFang SC;
					font-weight: 400;
					font-size: 20px;
					font-style: normal;
					text-transform: none;
					color: rgba(17,17,17,0.3);
				}
			}
		}
	}

	.bottom {
		width: 100%;
		margin-top: 17.6vh;
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
