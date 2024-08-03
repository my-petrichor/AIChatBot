
<script setup lang='ts'>
import{ ref } from 'vue'
import {NSplit} from 'naive-ui'
import LeftPanel from '@/components/styleChat/leftPanel/index.vue'
import RightPanel from '@/components/styleChat/rightPanel/index.vue'
</script>

<template>

	<div class="h-full w-full transition-all" style="height: 100% !important;">
    <NSplit direction="horizontal" style="" :default-size="0.2" :max="0.75" :min="0.25">
		<template #1>
			<div :style="{  }">
				<LeftPanel></LeftPanel>
			</div>
		</template>
		<template #2>
			<div class="h-full w-full" :style="{  }">
				<RightPanel></RightPanel>
			</div>
		</template>
	</NSplit>
  </div>
</template>
