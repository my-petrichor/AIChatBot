<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const Login = defineAsyncComponent(() => import('@/components/common/HomepageLogin/index.vue'))
const onClick = (name) => {
	router.push({
		name: name,
	})
}


</script>

<template>
  <div ref="index" class="index">
    <div class="header">
			<div class="headerUnit">
				<div class="headerLeft">
      		<img src="@/assets/logo.png" alt="Logo">
				</div>
				<div class="headerRight">
					<div :style="{ marginRight: '10px'}">Username</div>
					<div class="experience" @click="clickButton">退出</div>
				</div>
			</div>
    </div>

    <div class="middleContent">
      <div class="unit">
        <div class="lingshouyingxiao">
					<div class='lingshouyingxiaoLeft'>
						<div :style="{ fontSize: '50px', fontWeight: 'bold'}">AI零售营销</div>
						<div :style="{ fontSize: '25px'}">助力零售业绩</div>
					</div>
					<div class="middleContentiImage" @click="onClick('marketingWriting')">
						<div><img src="@/assets/avatar.jpg" alt="AI营销写作"></div>
						<div :style="{ fontSize: '20px'}">AI营销写作</div>
					</div>
					<div class="middleContentiImage" @click="onClick('styleChange')">
						<div><img src="@/assets/avatar.jpg" alt="AI风格改写"></div>
						<div :style="{ fontSize: '20px'}">AI风格改写</div>
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/avatar.jpg" alt="RAP自动运营账号"></div>
						<div :style="{ fontSize: '20px'}">RAP自动运营账号</div>
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/avatar.jpg" alt="营销决策，智能辅助"></div>
						<div :style="{ fontSize: '20px'}">营销决策，智能辅助</div>
					</div>
        </div>
				<div class="gukeyingxiao">
					<div class='gukeyingxiaoLeft'>
						<div :style="{ fontSize: '50px', fontWeight: 'bold'}">AI顾客营销</div>
						<div :style="{ fontSize: '25px'}">老顾客回流、提频</div>
					</div>
					<div class="middleContentiImage" @click="onClick('memeberPromotionCopywriting')">
						<div><img src="@/assets/avatar.jpg" alt="会员促活文案"></div>
						<div :style="{ fontSize: '20px'}">会员促活文案</div>
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/avatar.jpg" alt="只能评论处理"></div>
						<div :style="{ fontSize: '20px'}">只能评论处理</div>
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/avatar.jpg" alt="客诉智能回复"></div>
						<div :style="{ fontSize: '20px'}">客诉智能回复</div>
					</div>
        </div>
				<div class="qiangjigongcheng">
					<div class='qiangjigongchengLeft'>
						<div :style="{ fontSize: '50px', fontWeight: 'bold'}">强基工程</div>
						<div :style="{ fontSize: '25px'}">赋能中断人员成长</div>
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/avatar.jpg" alt="AI随身专家"></div>
						<div :style="{ fontSize: '20px'}">AI随身专家</div>
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/avatar.jpg" alt="智能培训"></div>
						<div :style="{ fontSize: '20px'}">智能培训</div>
					</div>
					<div class="middleContentiImage">
						<div><img src="@/assets/avatar.jpg" alt="智能督导"></div>
						<div :style="{ fontSize: '20px'}">智能督导</div>
					</div>
        </div>
      </div>
    </div>
		
    <div class="flex-center flex bottom">
      <div class="flex-center icp">
        <a target="_blank" href="https://beian.miit.gov.cn">京ICP备2023030175号-1</a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.index {
	width: 100%;
	overflow: scroll;
	background-image: url('@/assets/首页bg.png');
	background-size: cover;
	background-position: center;
	height: 100vh;

	.header {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 1vh;

		.headerUnit {
			width: 72vw;
			display: flex;
			flex-direction: row;
			justify-content:space-between;
			
			.headerRight{
				display: flex;
				flex-direction: row;
				align-items: center;
			}
		}
	}

	.middleContent {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 8vh;

		.unit {
			width: 72vw;
			height: 72vh;
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			align-items: flex-start;

			.lingshouyingxiao {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: row;
				cursor: pointer;
				
				.lingshouyingxiaoLeft{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					width: 20%;
				}
				.middleContentiImage{
					width: 20%;
					display: flex;
					flex-direction: column;
					align-items: center;
				}
			}
			.gukeyingxiao {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: row;

				.gukeyingxiaoLeft{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					width: 20%;
				}
				.middleContentiImage{
					display: flex;
					flex-direction: column;
					align-items: center;
					width: 20%;
				}

			}
			.qiangjigongcheng {
				width: 100%;
				display: flex;
				justify-content: flex-start;
				flex-direction: row;

				.qiangjigongchengLeft{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					width: 20%;
				}
				.middleContentiImage{
					display: flex;
					flex-direction: column;
					align-items: center;
					width: 20%;
				}
			}
		}
	}

	.flex-center {
		width: 100%;
		justify-content: center;
		align-items: center;
		display: flex;
		margin-top: 4vh;
	}

	.experience {
		cursor: pointer;
		justify-content: center;
		align-items: center;
		display: flex;
		font-size: 12px;
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
