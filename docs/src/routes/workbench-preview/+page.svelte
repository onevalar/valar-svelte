<script lang="ts">
	import { onMount } from "svelte";
	import * as Accordion from "$lib/registry/ui/accordion/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import {
		COMPONENTS,
		defaultPreset,
		presetSchema,
		type WorkbenchPreset,
		type ComponentId,
	} from "$lib/features/workbench/model.js";
	import { createWorkbenchCss } from "$lib/features/workbench/styles.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let preset = $state<WorkbenchPreset>(structuredClone(defaultPreset));
	let component = $state<ComponentId>("button");
	let dark = $state(false);
	let disabled = $state(false);
	let replay = $state(0);
	let dialogOpen = $state(false);
	let tooltipOpen = $state(false);
	const css = $derived(createWorkbenchCss(preset));
	const value = (key: string) => preset.values[key];
	onMount(() => {
		function receive(event: MessageEvent) {
			if (
				event.origin !== window.location.origin ||
				event.source !== window.parent ||
				event.data?.type !== "valar-workbench"
			)
				return;
			const parsed = presetSchema.safeParse(event.data.preset);
			if (!parsed.success || !COMPONENTS.some(({ id }) => id === event.data.component)) return;
			preset = parsed.data;
			if (component !== event.data.component) {
				dialogOpen = false;
				tooltipOpen = false;
			}
			component = event.data.component;
			dark = event.data.dark === true;
			disabled = event.data.disabled === true;
			if (replay !== event.data.replay) {
				replay = event.data.replay;
				dialogOpen = component === "dialog";
				tooltipOpen = component === "tooltip";
			}
		}
		window.addEventListener("message", receive);
		window.parent.postMessage({ type: "valar-workbench-ready" }, window.location.origin);
		return () => window.removeEventListener("message", receive);
	});
	$effect(() => {
		document.documentElement.classList.toggle("dark", dark);
	});
	$effect(() => {
		// Preview settings arrive on the client. Write validated CSS as text, not HTML.
		const style = document.createElement("style");
		style.textContent = css;
		document.head.append(style);
		return () => style.remove();
	});
</script>

<svelte:head>
	<title>Valar 组件预览</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	class="style-vega min-h-svh bg-background p-6 text-foreground sm:p-10"
	data-testid="workbench-canvas"
	style:background-color={dark ? "#18181b" : String(value("global.background"))}
	style:color={dark ? "#fafafa" : String(value("global.foreground"))}
>
	<p class="mb-12 text-xs tracking-widest text-muted-foreground">VALAR / LIVE COMPONENT</p>
	{#key `${component}:${replay}`}
		{#if component === "button"}
			<div class="space-y-8">
				<div>
					<h1 class="mb-2 text-xl font-semibold">按钮</h1>
					<p class="text-sm text-muted-foreground">悬停、按下或使用 Tab 键，检查真实交互。</p>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<Button {disabled}>主要操作</Button>
					<Button variant="outline" {disabled}>次要操作</Button>
					<Button variant="ghost" {disabled}>文字按钮</Button>
				</div>
				<div class="border-t pt-8">
					<p class="mb-4 text-xs text-muted-foreground">禁用状态</p>
					<Button disabled>不可用操作</Button>
				</div>
			</div>
		{:else if component === "dialog"}
			<Dialog.Root bind:open={dialogOpen}>
				<h1 class="mb-2 text-xl font-semibold">对话框</h1>
				<p class="mb-8 text-sm text-muted-foreground">打开后可测试遮罩点击、Esc 关闭和焦点恢复。</p>
				<Dialog.Trigger {disabled} class="rounded-md border px-4 py-2">打开对话框</Dialog.Trigger>
				<Dialog.Content
					showCloseButton={Boolean(value("dialog.showCloseButton"))}
					escapeKeydownBehavior={value("dialog.closeOnEscape") ? "close" : "ignore"}
					interactOutsideBehavior={value("dialog.closeOnOutside") ? "close" : "ignore"}
				>
					<Dialog.Header
						><Dialog.Title>让设计自然发生</Dialog.Title><Dialog.Description
							>调整参数，观察真实组件的外观与进入、退出效果。</Dialog.Description
						></Dialog.Header
					>
					<Dialog.Footer
						><Dialog.Close class="rounded-md border px-4 py-2">完成并关闭</Dialog.Close
						></Dialog.Footer
					>
				</Dialog.Content>
			</Dialog.Root>
		{:else if component === "tooltip"}
			<h1 class="mb-2 text-xl font-semibold">文字提示</h1>
			<p class="mb-12 text-sm text-muted-foreground">
				将指针移到按钮上或用 Tab 聚焦，验证延迟与位置。
			</p>
			<Tooltip.Provider delayDuration={Number(value("tooltip.delayDuration"))}>
				<Tooltip.Root bind:open={tooltipOpen}>
					<Tooltip.Trigger {disabled} class="mx-auto block rounded-md border px-4 py-2"
						>查看提示</Tooltip.Trigger
					>
					<Tooltip.Content
						side={String(value("tooltip.side")) as "top" | "right" | "bottom" | "left"}
						sideOffset={Number(value("tooltip.sideOffset"))}>把细节调到刚刚好</Tooltip.Content
					>
				</Tooltip.Root>
			</Tooltip.Provider>
		{:else}
			<h1 class="mb-2 text-xl font-semibold">折叠面板</h1>
			<p class="mb-8 text-sm text-muted-foreground">
				点击标题或使用方向键切换；支持单项与多项展开。
			</p>
			{#key `${value("accordion.type")}:${replay}`}
				<Accordion.Root
					type={value("accordion.type") === "multiple" ? "multiple" : "single"}
					disabled={disabled || Boolean(value("accordion.disabled"))}
				>
					{#each ["外观与尺寸", "动效与节奏", "交互与可访问性"] as title, index (title)}
						<Accordion.Item value={String(index)}
							><Accordion.Trigger>{title}</Accordion.Trigger><Accordion.Content
								><p>
									每一次调整都作用于真实组件，而不是静态图片。你的选择可以保存为预设，随组件一起安装。
								</p></Accordion.Content
							></Accordion.Item
						>
					{/each}
				</Accordion.Root>
			{/key}
		{/if}
	{/key}
</div>
