<script lang="ts">
	import { onMount, untrack } from "svelte";
	import { z } from "zod";
	import Metadata from "$lib/components/metadata.svelte";
	import ParameterPanel from "$lib/features/workbench/parameter-panel.svelte";
	import { coverage } from "$lib/features/workbench/coverage.js";
	import {
		COMPONENTS,
		PARAMETERS,
		defaultPreset,
		parseWorkbenchPreset,
		presetSchema,
		type WorkbenchPreset,
		type ComponentId,
	} from "$lib/features/workbench/model.js";

	const storageKey = "valar.workbench.v1";
	const storageSchema = z.object({ draft: presetSchema, versions: z.array(presetSchema).max(20) });
	let preset = $state<WorkbenchPreset>(structuredClone(defaultPreset));
	let versions = $state<WorkbenchPreset[]>([]);
	let component = $state<ComponentId>("button");
	let versionName = $state("");
	let loaded = $state(false);
	let revision = $state(0);
	let undo = $state<WorkbenchPreset[]>([]);
	let redo = $state<WorkbenchPreset[]>([]);
	let status = $state("调整参数即可实时预览。草稿自动保存在当前浏览器。");
	let storageError = $state("");
	let exporting = $state(false);
	let mobileTab = $state("preview");
	let width = $state("desktop");
	let dark = $state(false);
	let disabled = $state(false);
	let replay = $state(0);
	let frame = $state<HTMLIFrameElement>();
	let fileInput: HTMLInputElement;
	const selected = $derived(COMPONENTS.find(({ id }) => id === component)!);
	const count = $derived(
		PARAMETERS.filter((p) => p.component === "global" || p.component === component).length
	);

	onMount(() => {
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				const parsed = storageSchema.parse(JSON.parse(saved));
				preset = parsed.draft;
				versions = parsed.versions;
				status = "已恢复上次草稿及保存的版本。";
			}
		} catch {
			storageError = "本地草稿无法读取；未覆盖原始存储。可导入备份后再次保存。";
		}
		loaded = true;
		function receive(event: MessageEvent) {
			if (
				event.origin === location.origin &&
				event.source === frame?.contentWindow &&
				event.data?.type === "valar-workbench-ready"
			)
				syncPreview();
		}
		window.addEventListener("message", receive);
		return () => window.removeEventListener("message", receive);
	});

	$effect(() => {
		const snapshot = JSON.stringify({ draft: preset, versions });
		if (!loaded || storageError) return;
		try {
			localStorage.setItem(storageKey, snapshot);
		} catch {
			storageError = "浏览器存储不可用或空间不足；请导出预设备份，关闭页面会丢失未保存调整。";
		}
	});
	function syncPreview() {
		const message = {
			type: "valar-workbench",
			preset: $state.snapshot(preset),
			component,
			dark,
			disabled,
			replay,
		};
		frame?.contentWindow?.postMessage(message, location.origin);
	}
	// Load and client hydration can finish in either order. Every ready signal resends
	// the latest draft, even when an earlier post happened before the listener existed.
	$effect(syncPreview);

	function apply(next: WorkbenchPreset, remount = true) {
		const parsed = presetSchema.safeParse(next);
		if (!parsed.success) {
			status = "参数格式或范围无效，未应用本次更改。";
			return;
		}
		if (JSON.stringify(parsed.data) === JSON.stringify(preset)) return;
		undo = [...undo.slice(-49), structuredClone($state.snapshot(preset))];
		redo = [];
		preset = parsed.data;
		if (remount) revision++;
	}
	function change(values: WorkbenchPreset["values"]) {
		// Only the DialKit values are effect dependencies; do not subscribe that effect to the draft.
		untrack(() => apply({ ...preset, values: { ...preset.values, ...values } }, false));
	}
	function stepHistory(direction: "undo" | "redo") {
		const stack = direction === "undo" ? undo : redo;
		if (!stack.length) return;
		const current = structuredClone($state.snapshot(preset));
		preset = stack[stack.length - 1];
		if (direction === "undo") {
			undo = undo.slice(0, -1);
			redo = [...redo, current];
		} else {
			redo = redo.slice(0, -1);
			undo = [...undo, current];
		}
		revision++;
	}
	function resetCurrent() {
		const values = { ...preset.values };
		for (const parameter of PARAMETERS.filter((p) => p.component === component))
			values[parameter.key] = parameter.defaultValue;
		apply({ ...preset, values });
		status = "已重置当前组件；全局设置和其他组件保持不变，可撤销。";
	}
	function saveVersion() {
		const name = versionName.trim() || `版本 ${versions.length + 1}`;
		const next = presetSchema.safeParse({ ...preset, name });
		if (!next.success) {
			status = "版本名称请控制在 1–80 个字符。";
			return;
		}
		if (versions.length >= 20 && !versions.some((item) => item.name === name)) {
			status = "最多保存 20 个版本，请先删除不用的版本。";
			return;
		}
		apply(next.data, false);
		versions = [...versions.filter((item) => item.name !== name), structuredClone(next.data)];
		storageError = "";
		status = `已在当前浏览器保存「${name}」，未修改仓库或发布组件。`;
	}
	async function importFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			if (file.size > 2_000_000) throw new Error("文件过大");
			const next = parseWorkbenchPreset(await file.text());
			apply(next);
			versionName = next.name;
			storageError = "";
			status = `已导入「${next.name}」，可继续调整或撤销。`;
		} catch {
			status = "导入失败：请选择本工作台导出的预设，参数必须在允许范围内。原草稿未改变。";
		}
		input.value = "";
	}
	async function exportPreset() {
		exporting = true;
		try {
			const response = await fetch("/api/workbench/export", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(preset),
			});
			if (!response.ok) throw new Error((await response.json()).message);
			const url = URL.createObjectURL(await response.blob());
			const link = document.createElement("a");
			link.href = url;
			link.download = "valar-preset.json";
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			status =
				"已导出可安装文件（含预设、组件源码与 CSS）。交给开发者通过本地 CLI 安装；尚未推送或发布。";
		} catch (error) {
			status = error instanceof Error ? error.message : "导出失败，请重试。";
		} finally {
			exporting = false;
		}
	}
</script>

<Metadata
	title="组件调参工作台"
	description="用中文参数调节真实 Valar 组件，保存版本并导出可安装预设。"
/>

<div class="workbench border-t" data-testid="workbench">
	<div class="workbench-topbar">
		<div>
			<p class="eyebrow">
				VALAR STUDIO <span>{COMPONENTS.length} / {coverage.length} 首批接入</span>
			</p>
			<h1>组件调参工作台</h1>
		</div>
		<div class="toolbar-actions">
			<button onclick={() => stepHistory("undo")} disabled={!undo.length}>撤销</button>
			<button onclick={() => stepHistory("redo")} disabled={!redo.length}>重做</button>
			<button onclick={() => fileInput.click()}>导入</button>
			<button class="primary-action" onclick={exportPreset} disabled={exporting}
				>{exporting ? "正在导出…" : "导出可安装预设"}</button
			>
			<input
				bind:this={fileInput}
				type="file"
				accept=".json,application/json"
				onchange={importFile}
				aria-label="导入预设文件"
				class="sr-only"
			/>
		</div>
	</div>
	<div class="mobile-component">
		<label for="component-select">选择组件</label><select
			id="component-select"
			bind:value={component}
			>{#each COMPONENTS as item (item.id)}<option value={item.id}>{item.title}</option
				>{/each}</select
		>
	</div>
	<div class="mobile-tabs" aria-label="工作区视图">
		<button aria-pressed={mobileTab === "preview"} onclick={() => (mobileTab = "preview")}
			>真实预览</button
		><button aria-pressed={mobileTab === "controls"} onclick={() => (mobileTab = "controls")}
			>参数调节 · {count}</button
		>
	</div>
	<div class="workbench-grid">
		<aside class="component-sidebar" aria-label="组件列表">
			<div class="sidebar-heading">
				组件 <span>{COMPONENTS.length} / {coverage.length} 已接入</span>
			</div>
			<nav class="space-y-1">
				{#each COMPONENTS as item (item.id)}<button
						class:selected={component === item.id}
						aria-current={component === item.id ? "true" : undefined}
						onclick={() => (component = item.id)}
						><span>{item.title}</span><small>{item.id}</small></button
					>{/each}
			</nav>
			<div class="coverage-note">
				已接入表示具有首批可调参数，不代表该组件的每一个 API 都已参数化。
			</div>
			<details class="coverage-list">
				<summary>全部组件覆盖清单</summary>{#each coverage as item (item.id)}<div>
						<span>{item.id}</span><small>{item.ready ? "首批接入" : "待接入"}</small>
					</div>{/each}
			</details>
		</aside>
		<section
			class="preview-pane"
			class:mobile-hidden={mobileTab !== "preview"}
			aria-label="组件预览"
		>
			<div class="preview-toolbar">
				<div>
					<h2>{selected.title}</h2>
					<p>{selected.description}</p>
				</div>
				{#if component !== "button"}<button onclick={() => replay++}
						>{component === "accordion" ? "重置展开" : "重播 / 打开"}</button
					>{/if}
			</div>
			<div class="preview-options">
				<label
					>画布宽度<select aria-label="画布宽度" bind:value={width}
						><option value="desktop">自适应</option><option value="390">手机 · 390 px</option
						><option value="768">平板 · 768 px</option></select
					></label
				>
				<label><input type="checkbox" bind:checked={dark} /> 深色背景</label>
				<label><input type="checkbox" bind:checked={disabled} /> 预览禁用</label>
			</div>
			<div class="preview-stage">
				<div class="preview-frame" style:max-width={width === "desktop" ? "100%" : `${width}px`}>
					<iframe
						bind:this={frame}
						src="/workbench-preview"
						title="真实组件画布"
						onload={syncPreview}
					></iframe>
				</div>
			</div>
			<div class="preview-footnote">
				真实 Svelte 组件 · Tab / Esc 可测试 · 系统减少动态效果优先 · 预览状态不写入安装默认值
			</div>
		</section>
		<aside class="inspector" class:mobile-hidden={mobileTab !== "controls"} aria-label="参数面板">
			<div class="inspector-heading">
				<div>
					<h2>参数调节</h2>
					<p>{count} 项 · 中文名称与单位</p>
				</div>
				<button onclick={resetCurrent}>重置当前</button>
			</div>
			<p class="border-b px-4 py-3 text-[11px] leading-5 text-muted-foreground">
				独立参数需关闭对应的「继承全局」后生效。On = 开启，Off = 关闭。
			</p>
			<div class="inspector-controls">
				{#if loaded}{#key `${component}:${revision}`}<ParameterPanel
							{component}
							{preset}
							onchange={change}
						/>{/key}{:else}<p class="p-5 text-sm">正在恢复草稿…</p>{/if}
			</div>
		</aside>
	</div>
	<div class="preset-bar">
		<label
			>版本名称<input
				aria-label="版本名称"
				bind:value={versionName}
				maxlength="80"
				placeholder="例如：轻盈蓝 · v1"
			/></label
		><button onclick={saveVersion}>保存版本</button>
		<label
			>已存版本<select
				aria-label="已存版本"
				value=""
				onchange={(event) => {
					const saved = versions.find((item) => item.name === event.currentTarget.value);
					if (saved) {
						apply(structuredClone($state.snapshot(saved)));
						versionName = saved.name;
						status = `已恢复「${saved.name}」。`;
					}
					event.currentTarget.value = "";
				}}
				><option value="">选择并恢复…</option>{#each versions as item (item.name)}<option
						value={item.name}>{item.name}</option
					>{/each}</select
			></label
		>
		{#if versions.some((item) => item.name === versionName)}<button
				onclick={() => {
					versions = versions.filter((item) => item.name !== versionName);
					status = "已删除该本地版本；当前草稿保留。";
				}}>删除此版本</button
			>{/if}
		<button
			class="reset-all"
			onclick={() => {
				apply(structuredClone(defaultPreset));
				status = "全部参数已恢复初始值，可撤销。";
			}}>重置全部</button
		>
	</div>
	<p class="status-bar" role="status">{storageError || status}</p>
</div>

<style>
	.workbench {
		--studio-accent: #245dde;
		background: #f6f7f9;
		color: #20232b;
	}
	.workbench button,
	.workbench select,
	.workbench input:not([type="checkbox"]):not([type="file"]) {
		border: 1px solid #dfe2e8;
		border-radius: 7px;
		background: white;
		padding: 7px 10px;
		font-size: 12px;
		min-height: 34px;
	}
	.workbench button {
		cursor: pointer;
		transition: background-color 120ms;
	}
	.workbench button:hover:not(:disabled) {
		background: #edf2fc;
	}
	.workbench button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.workbench :is(button, select, input):focus-visible {
		outline: 2px solid var(--studio-accent);
		outline-offset: 2px;
	}
	.workbench-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 24px;
		background: white;
		border-bottom: 1px solid #e3e5eb;
	}
	h1 {
		font-size: 20px;
		font-weight: 650;
		letter-spacing: -0.03em;
	}
	.eyebrow {
		font-size: 10px;
		letter-spacing: 0.14em;
		color: #737a88;
		margin-bottom: 5px;
	}
	.eyebrow span {
		margin-left: 8px;
		color: var(--studio-accent);
		letter-spacing: 0;
	}
	.toolbar-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.workbench .primary-action {
		background: var(--studio-accent);
		color: white;
		border-color: var(--studio-accent);
	}
	.workbench .primary-action:hover {
		background: #194dbd;
	}
	.workbench-grid {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr) 320px;
		min-height: 660px;
		height: calc(100svh - 282px);
	}
	.component-sidebar {
		background: white;
		border-right: 1px solid #e3e5eb;
		padding: 20px 12px;
		overflow: auto;
	}
	.sidebar-heading {
		padding: 0 8px 16px;
		font-size: 13px;
		font-weight: 600;
	}
	.sidebar-heading span {
		display: block;
		margin-top: 5px;
		font-size: 11px;
		color: #737a88;
		font-weight: 400;
	}
	.workbench .component-sidebar nav button {
		display: flex;
		width: 100%;
		text-align: left;
		flex-direction: column;
		align-items: flex-start;
		border-color: transparent;
		padding: 10px 12px;
	}
	.workbench .component-sidebar nav button.selected {
		background: #ebf1ff;
		color: var(--studio-accent);
	}
	.component-sidebar nav small {
		color: #737a88;
		font-size: 10px;
		margin-top: 3px;
	}
	.coverage-note {
		padding: 20px 8px;
		font-size: 11px;
		color: #737a88;
		line-height: 1.7;
	}
	.coverage-list {
		padding: 12px 8px;
		border-top: 1px solid #e3e5eb;
		font-size: 11px;
	}
	.coverage-list summary {
		cursor: pointer;
		margin-bottom: 12px;
	}
	.coverage-list div {
		display: flex;
		gap: 4px;
		justify-content: space-between;
		padding: 5px 0;
	}
	.coverage-list small {
		color: #737a88;
		white-space: nowrap;
	}
	.preview-pane {
		display: flex;
		min-width: 0;
		flex-direction: column;
	}
	.preview-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px 12px;
		gap: 10px;
	}
	h2 {
		font-size: 14px;
		font-weight: 600;
	}
	.preview-toolbar p,
	.inspector-heading p {
		font-size: 11px;
		color: #737a88;
		margin-top: 5px;
		line-height: 1.6;
	}
	.preview-toolbar button {
		white-space: nowrap;
	}
	.preview-options {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		padding: 0 24px 16px;
		font-size: 11px;
		color: #626a79;
	}
	.preview-options label {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.preview-stage {
		display: flex;
		flex: 1;
		min-height: 400px;
		justify-content: center;
		padding: 0 24px;
	}
	.preview-frame {
		width: 100%;
		border: 1px solid #e3e5eb;
		border-radius: 12px;
		overflow: hidden;
		background: white;
		box-shadow: 0 4px 24px #1b294a06;
	}
	iframe {
		width: 100%;
		height: 100%;
		min-height: 480px;
		border: 0;
		display: block;
	}
	.preview-footnote {
		font-size: 10px;
		color: #737a88;
		padding: 14px 24px;
		line-height: 1.7;
	}
	.inspector {
		display: flex;
		flex-direction: column;
		min-height: 0;
		min-width: 0;
		border-left: 1px solid #e3e5eb;
		background: white;
	}
	.inspector-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px;
		border-bottom: 1px solid #e3e5eb;
	}
	.inspector-controls {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}
	.preset-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 10px;
		padding: 14px 24px;
		border-top: 1px solid #e3e5eb;
		background: white;
	}
	.preset-bar label {
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 11px;
		color: #626a79;
	}
	.preset-bar input {
		width: 180px;
	}
	.preset-bar select {
		max-width: 210px;
	}
	.preset-bar .reset-all {
		margin-left: auto;
	}
	.status-bar {
		padding: 10px 24px;
		min-height: 40px;
		font-size: 11px;
		color: #626a79;
		border-top: 1px solid #edf0f5;
	}
	.mobile-tabs,
	.mobile-component {
		display: none;
	}
	@media (max-width: 1100px) and (min-width: 761px) {
		.workbench-grid {
			grid-template-columns: 145px minmax(0, 1fr) 295px;
		}
		.preview-toolbar,
		.preview-options,
		.preview-footnote {
			padding-left: 14px;
			padding-right: 14px;
		}
		.preview-stage {
			padding: 0 14px;
		}
	}
	@media (max-width: 760px) {
		.workbench-topbar {
			padding: 16px;
			align-items: flex-start;
			flex-direction: column;
		}
		.toolbar-actions {
			width: 100%;
		}
		.toolbar-actions .primary-action {
			margin-left: auto;
		}
		.workbench-grid {
			display: block;
			min-height: 0;
			height: auto;
		}
		.component-sidebar {
			display: none;
		}
		.mobile-component {
			display: flex;
			padding: 12px 16px;
			gap: 12px;
			align-items: center;
			font-size: 12px;
			background: white;
		}
		.mobile-component select {
			flex: 1;
		}
		.mobile-tabs {
			display: flex;
			padding: 0 16px 12px;
			gap: 8px;
			background: white;
			border-bottom: 1px solid #e3e5eb;
		}
		.mobile-tabs button {
			flex: 1;
		}
		.mobile-tabs button[aria-pressed="true"] {
			color: var(--studio-accent);
			background: #ebf1ff;
			border-color: #c5d7ff;
		}
		.mobile-hidden {
			display: none;
		}
		.preview-toolbar {
			padding: 20px 16px 12px;
		}
		.preview-options {
			padding: 0 16px 16px;
		}
		.preview-stage {
			padding: 0 12px;
		}
		.preview-footnote {
			padding: 12px 16px;
		}
		.inspector {
			border-left: 0;
		}
		.inspector-controls {
			max-height: 65svh;
		}
		.preset-bar {
			padding: 14px 16px;
		}
		.preset-bar label {
			flex: 1;
			min-width: 140px;
		}
		.preset-bar input,
		.preset-bar select {
			width: 100%;
			max-width: 100%;
		}
		.preset-bar .reset-all {
			margin-left: 0;
		}
		.status-bar {
			padding: 12px 16px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.workbench button {
			transition: none;
		}
	}
</style>
