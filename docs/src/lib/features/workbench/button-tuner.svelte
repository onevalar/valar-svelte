<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import XIcon from "@lucide/svelte/icons/x";
	import { onMount, tick, type Component, type Snippet } from "svelte";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import {
		BUTTON_NUMBER_PARAMETERS,
		BUTTON_SIZES,
		BUTTON_STORAGE_KEY,
		RADIUS_LABEL,
		buttonChanges,
		buttonOverrideClasses,
		buttonOverrideCss,
		buttonVersionSchema,
		buttonVersionsSchema,
		readButtonValues,
		type ButtonOverrides,
		type ButtonValues,
		type ButtonVersion,
	} from "./button-tuning.js";
	import { styleOverridePath } from "./style-overrides.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const canWrite = import.meta.env.DEV;
	const FLASH_KEY = "valar.button-writeback.flash";
	const LABELS: Record<string, string> = {
		radius: RADIUS_LABEL,
		...Object.fromEntries(BUTTON_NUMBER_PARAMETERS.map(({ key, label }) => [key, label])),
	};
	const TOKENS = [
		["--radius", "圆角基数"],
		["--text-sm", "小号字"],
		["--primary", "主色"],
		["--background", "背景色"],
		["--foreground", "文字色"],
		["--border", "边框色"],
	] as const;
	let probe = $state<HTMLDivElement>();
	let openButton = $state<HTMLButtonElement>();
	let editing = $state(false);
	let loading = $state(false);
	let mode = $state<"light" | "dark">("light");
	let source = $state<ButtonVersion["source"]>();
	let baseline = $state<ButtonValues>();
	let tokens = $state<{ name: string; label: string; value: string }[]>([]);
	let draft = $state<ButtonOverrides>({});
	let versions = $state<ButtonVersion[]>([]);
	let selected = $state("");
	let comparison = $state("");
	let name = $state("");
	let message = $state("");
	let confirming = $state(false);
	let writing = $state(false);
	let panelKey = $state(0);
	let view = $state<"draft" | "compare">("draft");
	let canvasMode = $state<"light" | "dark">("light");
	const VARIANTS = [
		{ id: "default", label: "默认" },
		{ id: "outline", label: "描边" },
		{ id: "secondary", label: "次要" },
		{ id: "ghost", label: "幽灵" },
		{ id: "destructive", label: "危险" },
		{ id: "link", label: "链接" },
	] as const;
	let Panel = $state<
		Component<{
			initial: ButtonValues;
			theme: "light" | "dark";
			onchange: (values: ButtonValues) => void;
		}>
	>();
	const compatible = $derived(versions.filter((version) => version.source.style === source?.style));
	const active = $derived(compatible.find((version) => version.id === selected));
	const previous = $derived(compatible.find((version) => version.id === comparison));
	const currentOverrides = $derived(editing ? draft : (active?.overrides ?? {}));
	const initial = $derived(baseline ? { ...baseline, ...draft } : undefined);
	const changed = $derived(Object.keys(draft) as (keyof ButtonValues)[]);
	const styleName = $derived(source?.style.replace("style-", "") ?? "nova");
	const css = $derived(
		buttonOverrideCss(`[data-button-tuner="${id}"] [data-tuning-current]`, currentOverrides) +
			"\n" +
			buttonOverrideCss(
				`[data-button-tuner="${id}"] [data-tuning-before]`,
				previous?.overrides ?? {}
			)
	);

	function readSource(): ButtonVersion["source"] {
		const owner = probe!.closest('[class*="style-"]');
		return {
			style:
				[...(owner?.classList ?? [])].find((value) => value.startsWith("style-")) ?? "style-nova",
		};
	}

	onMount(() => {
		message = sessionStorage.getItem(FLASH_KEY) ?? "";
		sessionStorage.removeItem(FLASH_KEY);
		try {
			versions = buttonVersionsSchema.parse(
				JSON.parse(localStorage.getItem(BUTTON_STORAGE_KEY) ?? "[]")
			);
		} catch {
			message = "无法读取本地版本；原有数据未覆盖。可以导入备份，或检查浏览器存储。";
		}
		source = readSource();
	});
	$effect(() => {
		const style = document.createElement("style");
		style.textContent = css;
		document.head.append(style);
		return () => style.remove();
	});

	async function begin() {
		loading = true;
		message = "";
		try {
			Panel = (await import("./button-parameter-panel.svelte")).default;
			source = readSource();
			mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
			canvasMode = mode;
			view = "draft";
			baseline = readButtonValues(probe!);
			const computed = getComputedStyle(probe!.querySelector<HTMLElement>("[data-probe-size]")!);
			tokens = TOKENS.map(([name, label]) => ({
				name,
				label,
				value: computed.getPropertyValue(name).trim(),
			}));
			draft = { ...active?.overrides };
			comparison = selected;
			name = "";
			confirming = false;
			editing = true;
			panelKey++;
		} catch {
			message = "参数面板加载失败，请重试。";
		} finally {
			loading = false;
		}
	}

	async function close() {
		editing = false;
		draft = {};
		confirming = false;
		await tick();
		openButton?.focus({ preventScroll: true });
	}

	function revert() {
		draft = { ...active?.overrides };
		confirming = false;
		panelKey++;
	}

	function makeVersion(): ButtonVersion {
		return buttonVersionSchema.parse({
			format: 2,
			component: "button",
			id: crypto.randomUUID(),
			name: name.trim(),
			createdAt: new Date().toISOString(),
			source,
			baseline,
			overrides: draft,
		});
	}

	function persist(version: ButtonVersion) {
		// Read again so a save does not silently discard versions written in another tab.
		const stored = buttonVersionsSchema.parse(
			JSON.parse(localStorage.getItem(BUTTON_STORAGE_KEY) ?? "[]")
		);
		if (stored.some((item) => item.name === version.name))
			throw new Error("名称已存在，请使用新名称，旧版本不会被覆盖。");
		if (stored.length >= 50) throw new Error("已达到 50 个版本上限，请先导出备份。");
		const next = buttonVersionsSchema.parse([...stored, version]);
		localStorage.setItem(BUTTON_STORAGE_KEY, JSON.stringify(next));
		versions = next;
		selected = version.id;
	}

	function save() {
		try {
			persist(makeVersion());
			message = `已保存「${name.trim()}」。旧版本保持不变。`;
		} catch (error) {
			message =
				error instanceof Error && !error.message.startsWith("[")
					? `保存失败：${error.message}`
					: "保存失败：请填写有效名称并检查参数。草稿仍保留。";
		}
	}

	async function writeBack() {
		writing = true;
		message = "正在写回并重建 registry，约需 10 秒…";
		try {
			const response = await fetch("/__valar/style-overrides", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ style: styleName, classes: buttonOverrideClasses(draft) }),
			});
			const body = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
			sessionStorage.setItem(
				FLASH_KEY,
				`已写回 ${body.file}，Button 默认样式已更新，registry 已重建。改动尚未提交到 Git。`
			);
			location.reload();
		} catch (error) {
			message = `写回失败：${error instanceof Error ? error.message : "未知错误"}。草稿仍保留。`;
			writing = false;
		}
	}

	function download() {
		try {
			const version = editing ? makeVersion() : active;
			if (!version) return;
			const url = URL.createObjectURL(
				new Blob([JSON.stringify(version, null, 2)], { type: "application/json" })
			);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = "valar-button-style.json";
			anchor.click();
			URL.revokeObjectURL(url);
			message = "已导出参数版本备份；不是组件安装包，也不会修改仓库源码。";
		} catch {
			message = "导出失败：请先填写版本名称并检查参数。";
		}
	}

	async function importVersion(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		try {
			const file = input.files?.[0];
			if (!file) return;
			if (file.size > 50_000) throw new Error("文件超过 50 KB");
			const version = buttonVersionSchema.parse(JSON.parse(await file.text()));
			if (version.source.style !== source?.style) throw new Error("样式与当前示例不匹配");
			persist({ ...version, id: crypto.randomUUID() });
			message = `已导入「${version.name}」。`;
		} catch {
			message = "导入失败：文件无效、名称重复、样式不匹配或存储不可用；当前版本未改变。";
		} finally {
			input.value = "";
		}
	}
</script>

{#snippet sizeRow()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-size={size.id}>{size.label}</Button>
	{/each}
{/snippet}

{#snippet grid(pane: "current" | "before", caption: string)}
	<figure
		class={[
			"min-w-0 rounded-xl border bg-background text-foreground",
			canvasMode === "dark" && "dark",
		]}
		data-tuning-current={pane === "current" ? "" : undefined}
		data-tuning-before={pane === "before" ? "" : undefined}
	>
		<figcaption class="border-b px-4 py-2.5 text-xs text-muted-foreground">{caption}</figcaption>
		<div class="overflow-x-auto p-4">
			<div class="matrix">
				<span></span>
				{#each VARIANTS as variant (variant.id)}<span class="axis">{variant.label}</span>{/each}
				<span class="axis">图标</span>
				{#each BUTTON_SIZES as size (size.id)}
					<span class="axis">{size.label}</span>
					{#each VARIANTS as variant (variant.id)}
						<Button variant={variant.id} size={size.id}>按钮</Button>
					{/each}
					<Button variant="outline" size={size.icon} aria-label={`${size.label}尺寸图标按钮`}
						><ArrowUpIcon /></Button
					>
				{/each}
			</div>
		</div>
	</figure>
{/snippet}

{#snippet status()}
	{#if message}<p role="status" class="notice">{message}</p>{/if}
{/snippet}

<section class="button-tuner" data-button-tuner={id} aria-label="Button 样式微调">
	<div class="toolbar">
		<div>
			<span class="eyebrow">BUTTON / 组件参数</span>
			<p class="context">{styleName} · 全部变体共用尺寸与圆角档位</p>
		</div>
		<label class="version-select"
			>使用版本
			<select aria-label="Button 使用版本" bind:value={selected} disabled={editing}>
				<option value="">当前组件库样式</option>
				{#each compatible as version (version.id)}<option value={version.id}>{version.name}</option
					>{/each}
			</select>
		</label>
		<button class="action primary" bind:this={openButton} onclick={begin} disabled={loading}
			>{loading ? "加载中…" : "微调 Button"}</button
		>
	</div>
	{#if !editing}{@render status()}{/if}
	<div class="sample" data-tuning-current>{@render children()}</div>
	<!-- Unmodified instances supply the rendered values of every size and the radius levels. -->
	<div class="probe" bind:this={probe} aria-hidden="true" inert>
		{@render sizeRow()}
		<span data-probe-radius></span>
	</div>
	<div class="backup-row">
		<label class="import-label"
			>导入版本备份<input
				aria-label="导入 Button 版本"
				type="file"
				accept=".json,application/json"
				onchange={importVersion}
			/></label
		>
		{#if active}<button class="action" onclick={download}>导出当前版本</button>{/if}
		<span>版本保存在本地浏览器；写回组件库在微调编辑器中确认</span>
	</div>
</section>

<Dialog.Root
	open={editing}
	onOpenChange={(open) => {
		if (!open) close();
	}}
>
	<Dialog.Content
		data-button-tuner={id}
		showCloseButton={false}
		class="flex h-dvh w-screen max-w-none flex-col gap-0 rounded-none p-0 ring-0 sm:max-w-none"
		onCloseAutoFocus={(event) => {
			event.preventDefault();
			openButton?.focus({ preventScroll: true });
		}}
	>
		<header class="flex flex-wrap items-center gap-2 border-b px-4 py-3">
			<div class="mr-auto min-w-0">
				<Dialog.Title class="text-base font-semibold">Button · 组件参数</Dialog.Title>
				<Dialog.Description class="text-xs text-muted-foreground">
					{styleName} · 尺寸参数作用于该尺寸的所有变体，图标按钮跟随同档高度
				</Dialog.Description>
			</div>
			<Badge variant={changed.length ? "default" : "secondary"}>已修改 {changed.length} 项</Badge>
			<Input
				aria-label="Button 版本名称"
				bind:value={name}
				maxlength={60}
				placeholder="版本名称"
				class="w-40"
			/>
			<Button variant="outline" onclick={save} disabled={!name.trim()}>保存版本</Button>
			{#if canWrite}
				<Button onclick={() => (confirming = true)} disabled={!changed.length || writing}
					>写回组件库…</Button
				>
			{/if}
			<Button variant="ghost" size="icon" aria-label="关闭" onclick={close}><XIcon /></Button>
		</header>
		<div
			class="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden"
		>
			<section aria-label="预览" class="flex min-w-0 flex-col gap-4 p-4 md:p-6 lg:overflow-y-auto">
				<div class="flex flex-wrap items-center gap-3">
					<ToggleGroup.Root
						type="single"
						variant="outline"
						size="sm"
						value={view}
						onValueChange={(value) => value && (view = value as typeof view)}
						aria-label="预览方式"
					>
						<ToggleGroup.Item value="draft">仅草稿</ToggleGroup.Item>
						<ToggleGroup.Item value="compare">并排对比</ToggleGroup.Item>
					</ToggleGroup.Root>
					{#if view === "compare"}
						<label class="flex items-center gap-2 text-sm"
							>对比基线
							<select
								aria-label="Button 对比版本"
								bind:value={comparison}
								class="h-8 rounded-md border bg-background px-2 text-sm"
							>
								<option value="">当前组件库样式</option>
								{#each compatible as version (version.id)}<option value={version.id}
										>{version.name}</option
									>{/each}
							</select>
						</label>
					{/if}
					<ToggleGroup.Root
						type="single"
						variant="outline"
						size="sm"
						class="ml-auto"
						value={canvasMode}
						onValueChange={(value) => value && (canvasMode = value as typeof canvasMode)}
						aria-label="画布明暗"
					>
						<ToggleGroup.Item value="light">浅色</ToggleGroup.Item>
						<ToggleGroup.Item value="dark">深色</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>
				<div class={["grid gap-4", view === "compare" && "2xl:grid-cols-2"]}>
					{#if view === "compare"}
						{@render grid("before", `对比基线 · ${previous?.name ?? "当前组件库样式"}`)}
					{/if}
					{@render grid("current", `草稿 · ${changed.length} 项修改 · 实时预览`)}
				</div>
			</section>
			<aside
				aria-label="参数"
				class="flex min-w-0 flex-col gap-5 border-t p-4 lg:overflow-y-auto lg:border-t-0 lg:border-l"
			>
				{@render status()}
				{#if Panel && initial && baseline}
					{#key panelKey}
						<Panel
							{initial}
							theme={mode}
							onchange={(values) => {
								draft = buttonChanges(baseline!, values);
								confirming = false;
							}}
						/>
					{/key}
				{/if}
				<section class="grid gap-2">
					<h3 class="text-xs font-semibold text-muted-foreground">
						已修改参数（{changed.length}）
					</h3>
					{#if !changed.length}<p class="text-xs text-muted-foreground">尚未修改。</p>{/if}
					<dl class="grid gap-1.5 text-xs">
						{#each changed as key (key)}
							<div class="flex justify-between gap-2">
								<dt>{LABELS[key]}</dt>
								<dd class="text-muted-foreground tabular-nums">
									{baseline?.[key]} → {draft[key]}
								</dd>
							</div>
						{/each}
					</dl>
					<div class="flex flex-wrap gap-2 pt-1">
						<Button variant="outline" size="sm" onclick={revert} disabled={!changed.length}
							>撤回未保存修改</Button
						>
						<Button variant="ghost" size="sm" onclick={download} disabled={!name.trim()}
							>导出备份</Button
						>
					</div>
				</section>
				<section class="grid gap-2">
					<h3 class="text-xs font-semibold text-muted-foreground">全局 token（只读）</h3>
					<p class="text-xs leading-relaxed text-muted-foreground">
						影响所有组件，在组件页不能修改，请到<a class="underline" href="/themes">全局主题页</a
						>统一配置。
					</p>
					<dl class="grid gap-1.5 text-xs">
						{#each tokens as token (token.name)}
							<div class="flex items-center justify-between gap-2">
								<dt class="flex items-center gap-2">
									<span
										class="size-3 shrink-0 rounded-sm border"
										style:background={token.name === "--radius" || token.name === "--text-sm"
											? "transparent"
											: `var(${token.name})`}
									></span>{token.label}
								</dt>
								<dd class="truncate text-muted-foreground">
									<code>{token.name}</code>
									{token.value}
								</dd>
							</div>
						{/each}
					</dl>
				</section>
				<p class="text-xs leading-relaxed text-muted-foreground">
					{#if canWrite}
						版本只保存在当前浏览器，最多 50 个，同名不覆盖。“写回组件库”会修改仓库源码，需要提交到
						Git 才会保留。
					{:else}
						写回只在本地开发站（pnpm dev）提供；当前站点只能保存和导出版本。
					{/if}
				</p>
			</aside>
		</div>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={confirming}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>写回组件库</AlertDialog.Title>
			<AlertDialog.Description>
				将写入 <code>docs/{styleOverridePath(styleName)}</code> 并重建 registry。上游样式文件不变；以后从
				Valar 安装的 Button 都会使用以下修改：
			</AlertDialog.Description>
		</AlertDialog.Header>
		<ul class="list-disc pl-5 text-sm">
			{#each changed as key (key)}<li>{LABELS[key]}：{baseline?.[key]} → {draft[key]}</li>{/each}
		</ul>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={writing}>返回修改</AlertDialog.Cancel>
			<AlertDialog.Action onclick={writeBack} disabled={writing}
				>{writing ? "写回中…" : "确认写回"}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style>
	.button-tuner {
		position: relative;
		width: 100%;
		min-width: 0;
		font-size: 13px;
	}
	.toolbar,
	.backup-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}
	.toolbar {
		padding: 16px;
		border-bottom: 1px solid var(--border);
	}
	.toolbar > :first-child {
		margin-right: auto;
	}
	.eyebrow {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: var(--muted-foreground);
	}
	.context {
		margin: 4px 0 0;
		font-size: 12px;
		color: var(--muted-foreground);
	}
	.action,
	select {
		border: 1px solid var(--border);
		border-radius: 7px;
		background: var(--background);
		color: var(--foreground);
		padding: 8px 10px;
		font: inherit;
		max-width: 100%;
		min-width: 0;
	}
	.action {
		cursor: pointer;
	}
	.action:hover {
		background: var(--muted);
	}
	.action:disabled,
	select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.primary {
		background: var(--primary);
		color: var(--primary-foreground);
		border-color: var(--primary);
	}
	.primary:hover {
		opacity: 0.85;
		background: var(--primary);
	}
	.action:focus-visible,
	select:focus-visible,
	input:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 3px;
	}
	.version-select {
		display: flex;
		gap: 8px;
		align-items: center;
		min-width: 0;
	}
	.version-select select {
		max-width: 170px;
	}
	.sample {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 140px;
		padding: 24px 12px;
		overflow-x: auto;
	}
	.probe {
		position: absolute;
		visibility: hidden;
		pointer-events: none;
		top: 0;
		left: 0;
	}
	.matrix {
		display: grid;
		grid-template-columns: auto repeat(7, auto);
		gap: 16px 14px;
		align-items: center;
		justify-items: start;
		width: max-content;
	}
	.axis {
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.backup-row {
		padding: 12px 16px;
		border-top: 1px solid var(--border);
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.import-label {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}
	.import-label input {
		max-width: 200px;
		font-size: 11px;
	}
	.notice {
		margin: 0;
		padding: 12px 16px;
		border-top: 1px solid var(--border);
		font-size: 12px;
		overflow-wrap: anywhere;
	}
	aside .notice {
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	@media (max-width: 640px) {
		.sample {
			min-height: 120px;
			padding: 16px 8px;
		}
		.version-select {
			width: 100%;
			order: 1;
		}
	}
</style>
