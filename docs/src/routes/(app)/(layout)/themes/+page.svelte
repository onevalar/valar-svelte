<script lang="ts">
	import CardsDemo from "$lib/components/cards/cards-demo.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import ThemeCustomizer from "$lib/components/theme-customizer.svelte";
</script>

<Metadata title="设计 token" description="Valar 的全局颜色、圆角与字号 token。" />

<div class="container-wrapper">
	<div class="container px-6 pt-8 md:px-8">
		<h1 class="text-2xl font-semibold tracking-tight">设计 token</h1>
		<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
			颜色、圆角和字号是所有组件共用的全局
			token。目前可以切换预设主题、预览效果并复制代码；统一编辑并写回组件库的配置功能正在规划中。
		</p>
	</div>
</div>

<div id="themes" class="container-wrapper scroll-mt-20">
	<div class="container flex items-center justify-between gap-8 px-6 py-4 md:px-8">
		<ThemeCustomizer />
	</div>
</div>
<div class="container-wrapper flex flex-1 flex-col section-soft pb-6">
	<div class="container flex flex-1 flex-col theme-container">
		<CardsDemo />
	</div>
</div>
