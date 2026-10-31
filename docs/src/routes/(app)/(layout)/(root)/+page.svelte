<svelte:options runes />

<script lang="ts">
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import BoxesIcon from "@lucide/svelte/icons/boxes";
	import PaletteIcon from "@lucide/svelte/icons/palette";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import Announcement from "$lib/components/announcement.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import PageActions from "$lib/components/page-header/page-actions.svelte";
	import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
	import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
	import PageHeader from "$lib/components/page-header/page-header.svelte";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	const title = "Valar，始于组件。";
	const description =
		"一套设计 token，一组可调参的 Svelte 组件。先统一全局，再微调组件，源码都由你掌握。";
	// Every component directory has an index.ts; the glob only lists paths, nothing is loaded.
	const componentCount = Object.keys(import.meta.glob("$lib/registry/ui/*/index.ts")).length;

	const colors = [
		["--background", "背景"],
		["--foreground", "文字"],
		["--primary", "主色"],
		["--secondary", "次要"],
		["--muted", "弱化"],
		["--border", "边框"],
		["--destructive", "危险"],
	] as const;
	const radii = ["sm", "md", "lg", "xl", "2xl"] as const;
	const radiusClass: Record<(typeof radii)[number], string> = {
		sm: "rounded-sm",
		md: "rounded-md",
		lg: "rounded-lg",
		xl: "rounded-xl",
		"2xl": "rounded-2xl",
	};
	const types = [
		["text-xs", "xs"],
		["text-sm", "sm"],
		["text-base", "base"],
		["text-xl", "xl"],
	] as const;

	let height = $state(32);
	let notify = $state(true);
</script>

<Metadata {title} {description} />

{#snippet sectionHead(Icon: typeof PaletteIcon, id: string, name: string, text: string)}
	<div class="flex flex-col gap-2">
		<Icon class="size-5 text-muted-foreground" aria-hidden="true" />
		<h2 {id} class="text-lg font-semibold">{name}</h2>
		<p class="text-sm leading-relaxed text-muted-foreground">{text}</p>
	</div>
{/snippet}

{#snippet sectionLink(href: string, label: string)}
	<a
		{href}
		class="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium underline-offset-4 hover:underline"
		>{label}<ArrowRightIcon class="size-4" aria-hidden="true" /></a
	>
{/snippet}

<div class="flex flex-1 flex-col">
	<PageHeader class="md:**:[.container]:pb-8 lg:**:[.container]:pb-10">
		<Announcement />
		<PageHeaderHeading class="max-w-4xl">{title}</PageHeaderHeading>
		<PageHeaderDescription>{description}</PageHeaderDescription>
		<PageActions>
			<Button href="/docs/components">浏览组件</Button>
			<Button href="/docs/installation" variant="outline">安装</Button>
		</PageActions>
	</PageHeader>
	<div class="container-wrapper flex-1 pb-12">
		<div class="container grid gap-4 px-6 md:grid-cols-3">
			<section
				aria-labelledby="home-tokens"
				class="flex flex-col gap-5 rounded-xl border bg-card p-5"
			>
				{@render sectionHead(
					PaletteIcon,
					"home-tokens",
					"全局 token",
					"颜色、圆角和字号在这里统一，所有组件一起生效，浅色与深色分开维护。"
				)}
				<div>
					<p class="mb-2 text-xs text-muted-foreground">颜色</p>
					<ul class="grid grid-cols-7 gap-1.5">
						{#each colors as [token, label] (token)}
							<li class="flex flex-col items-center gap-1" title={token}>
								<span
									class="aspect-square w-full rounded-md border"
									style:background={`var(${token})`}
								></span>
								<span class="text-[11px] text-muted-foreground">{label}</span>
							</li>
						{/each}
					</ul>
				</div>
				<div>
					<p class="mb-2 text-xs text-muted-foreground">圆角（随 --radius 等比变化）</p>
					<ul class="flex items-end gap-2">
						{#each radii as radius (radius)}
							<li class="flex flex-col items-center gap-1">
								<span
									class="size-9 border-t-2 border-l-2 border-foreground/60 {radiusClass[radius]}"
									aria-hidden="true"
								></span>
								<span class="text-[11px] text-muted-foreground">{radius}</span>
							</li>
						{/each}
					</ul>
				</div>
				<div>
					<p class="mb-2 text-xs text-muted-foreground">字号</p>
					<ul class="flex items-baseline gap-4">
						{#each types as [cls, label] (cls)}
							<li class="flex flex-col items-center gap-1">
								<span class={cls}>Aa</span>
								<span class="text-[11px] text-muted-foreground">{label}</span>
							</li>
						{/each}
					</ul>
				</div>
				{@render sectionLink("/themes", "查看 token")}
			</section>

			<section
				aria-labelledby="home-components"
				class="flex flex-col gap-5 rounded-xl border bg-card p-5"
			>
				{@render sectionHead(
					BoxesIcon,
					"home-components",
					"组件",
					"基于 Bits UI 的 Svelte 组件，保留键盘与无障碍行为，通过 CLI 把源码装进你的项目。"
				)}
				<p class="flex items-baseline gap-1.5">
					<span class="text-4xl font-semibold tabular-nums">{componentCount}</span>
					<span class="text-sm text-muted-foreground">个组件</span>
				</p>
				<div class="grid gap-3 rounded-lg bg-muted/50 p-4">
					<div class="flex flex-wrap items-center gap-2">
						<Button size="sm">按钮</Button>
						<Button size="sm" variant="outline">描边</Button>
						<Badge variant="secondary">标签</Badge>
					</div>
					<Input aria-label="示例输入框" placeholder="输入框" />
					<label class="flex items-center justify-between gap-2 text-sm">
						接收通知 <Switch bind:checked={notify} aria-label="接收通知" />
					</label>
				</div>
				{@render sectionLink("/docs/components", "浏览全部组件")}
			</section>

			<section
				aria-labelledby="home-tuning"
				class="flex flex-col gap-5 rounded-xl border bg-card p-5"
			>
				{@render sectionHead(
					SlidersHorizontalIcon,
					"home-tuning",
					"调参",
					"在组件页打开微调，实时预览尺寸和圆角档位，满意后写回组件库。"
				)}
				<div class="grid gap-4 rounded-lg bg-muted/50 p-4">
					<div class="flex h-24 items-center justify-center">
						<Button variant="outline" style="height: {height}px">按钮</Button>
					</div>
					<div class="grid gap-2">
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>默认尺寸 · 高度</span><span class="tabular-nums">{height}px</span>
						</div>
						<Slider type="single" aria-label="示例按钮高度" bind:value={height} min={24} max={56} />
					</div>
					<p class="text-xs text-muted-foreground">这里只是演示，不会保存。</p>
				</div>
				{@render sectionLink("/docs/components/button", "试试微调 Button")}
			</section>
		</div>
	</div>
</div>
