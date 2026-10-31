<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import { onMount, tick, type Component, type Snippet } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
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
			await tick();
			document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
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

{#snippet sizeRow(isProbe = false)}
	<div class="size-row">
		{#each BUTTON_SIZES as size (size.id)}
			<div class="size-pair">
				<Button variant="outline" size={size.id} data-probe-size={isProbe ? size.id : undefined}
					>{size.label}</Button
				>
				<Button variant="outline" size={size.icon} aria-label={`${size.label}尺寸图标按钮`}
					><ArrowUpIcon /></Button
				>
			</div>
		{/each}
	</div>
{/snippet}

<section class="button-tuner" data-button-tuner={id} aria-label="Button 样式微调">
	<div class="toolbar">
		<div>
			<span class="eyebrow">BUTTON / 组件参数</span>
			<p class="context">{styleName} · 全部变体共用尺寸与圆角档位</p>
		</div>
		{#if !editing}
			<label class="version-select"
				>使用版本
				<select aria-label="Button 使用版本" bind:value={selected}>
					<option value="">当前组件库样式</option>
					{#each compatible as version (version.id)}<option value={version.id}
							>{version.name}</option
						>{/each}
				</select>
			</label>
			<button class="action primary" bind:this={openButton} onclick={begin} disabled={loading}
				>{loading ? "加载 DialKit…" : "微调 Button"}</button
			>
		{:else}
			<button class="action" onclick={close}>取消未保存修改 / 关闭</button>
		{/if}
	</div>
	{#if message}<p role="status" class="notice">{message}</p>{/if}
	{#if editing}
		<div class="editor-heading">
			<h2 id={`${id}-title`} tabindex="-1">微调 Button 组件参数</h2>
			<p>
				尺寸参数作用于该尺寸的所有变体（实心、描边、幽灵等），图标按钮跟随同档高度。颜色、圆角基数和字号属于全局
				token，这里只读。
			</p>
		</div>
	{/if}
	<div class:comparing={editing} class="samples">
		{#if editing}
			<div class="sample-column">
				<label class="sample-label"
					>对比基线
					<select aria-label="Button 对比版本" bind:value={comparison}>
						<option value="">当前组件库样式</option>
						{#each compatible as version (version.id)}<option value={version.id}
								>{version.name}</option
							>{/each}
					</select>
				</label>
				<div class="sample" data-tuning-before>
					{@render children()}
					{@render sizeRow()}
				</div>
			</div>
		{/if}
		<div class="sample-column">
			{#if editing}<p class="sample-label">
					当前草稿 <span>{changed.length} 项修改 · 实时预览</span>
				</p>{/if}
			<div class="sample" data-tuning-current>
				{@render children()}
				{#if editing}{@render sizeRow()}{/if}
			</div>
		</div>
	</div>
	<!-- Unmodified instances supply the rendered values of every size and the radius levels. -->
	<div class="probe" bind:this={probe} aria-hidden="true" inert>
		{@render sizeRow(true)}
		<span data-probe-radius></span>
	</div>
	{#if editing && Panel && initial && baseline}
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
		<div role="region" aria-label="样式版本">
			<div class="versions">
				<p class="section-label">写回组件库</p>
				{#if !canWrite}
					<p class="help">写回只在本地开发站（pnpm dev）提供；当前站点只能保存和导出版本。</p>
				{:else if !confirming}
					<button
						class="action primary"
						disabled={!changed.length || writing}
						onclick={() => (confirming = true)}>写回组件库…</button
					>
					<p class="help">
						把当前草稿设为 Valar Button 的默认样式（{styleName}）。写入后需要提交到 Git 才会保留。
					</p>
				{:else}
					<div class="confirm" role="group" aria-label="确认写回">
						<p>
							将写入 <code>docs/{styleOverridePath(styleName)}</code>，并重建
							registry。上游样式文件不变；以后从 Valar 安装的 Button 都会使用以下修改：
						</p>
						<ul>
							{#each changed as key (key)}<li>
									{LABELS[key]}：{baseline[key]} → {draft[key]}
								</li>{/each}
						</ul>
						<div class="actions">
							<button class="action primary" onclick={writeBack} disabled={writing}
								>{writing ? "写回中…" : "确认写回"}</button
							>
							<button class="action" onclick={() => (confirming = false)} disabled={writing}
								>返回修改</button
							>
						</div>
					</div>
				{/if}
			</div>
			<div class="versions">
				<p class="section-label">全局 token（只读）</p>
				<p class="help">
					这些值影响所有组件，在组件页不能修改，请到<a href="/themes">全局主题页</a>统一配置。
				</p>
				<dl class="tokens">
					{#each tokens as token (token.name)}
						<div>
							<dt>{token.label}</dt>
							<dd><code>{token.name}</code> {token.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
			<div class="versions">
				<p class="section-label">保存为新样式版本</p>
				<label
					>版本名称<input
						aria-label="Button 版本名称"
						bind:value={name}
						maxlength="60"
						placeholder="例如：更宽松的按钮"
					/></label
				>
				<div class="actions">
					<button class="action primary" onclick={save} disabled={!name.trim()}>保存新版本</button>
					<button class="action" onclick={download} disabled={!name.trim()}>导出备份</button>
					<button
						class="action"
						onclick={() => {
							draft = { ...active?.overrides };
							confirming = false;
							panelKey++;
						}}>撤回未保存修改</button
					>
				</div>
				<p class="help">
					版本只保存在当前浏览器，最多 50 个；同名不覆盖。导出文件可在其他浏览器导入。DialKit
					的原生缩略图用于本次微调；跨刷新保留请在此命名保存或导出。
				</p>
				<details open>
					<summary>已修改参数（{changed.length}）</summary>
					{#if !changed.length}<p class="help">尚未修改，当前效果与所选样式一致。</p>{/if}
					<dl>
						{#each changed as key (key)}
							<div>
								<dt>{LABELS[key]}</dt>
								<dd>{baseline[key]} → {draft[key]}</dd>
							</div>
						{/each}
					</dl>
				</details>
			</div>
		</div>
	{:else if !editing}
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
			<span>版本保存在本地浏览器；写回组件库需在微调面板中确认</span>
		</div>
	{/if}
</section>

<style>
	.button-tuner {
		position: relative;
		width: 100%;
		min-width: 0;
		font-size: 13px;
	}
	.toolbar,
	.actions,
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
	.eyebrow,
	.section-label {
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
	select,
	input:not([type="file"]) {
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
	.action:disabled {
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
	.editor-heading {
		padding: 20px 16px 4px;
	}
	.editor-heading h2 {
		margin: 0 0 6px;
		font-size: 18px;
		font-weight: 600;
	}
	.editor-heading p,
	.help {
		color: var(--muted-foreground);
		font-size: 12px;
		line-height: 1.7;
	}
	.samples {
		display: grid;
	}
	.comparing {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: auto 1fr;
		margin: 16px;
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
	}
	.sample-column {
		min-width: 0;
	}
	.comparing .sample-column {
		display: grid;
		grid-template-rows: subgrid;
		grid-row: span 2;
	}
	.comparing .sample-column + .sample-column {
		border-left: 1px solid var(--border);
	}
	.sample-label {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		gap: 8px;
		align-items: flex-start;
		min-height: 63px;
		margin: 0;
		padding: 10px;
		font-size: 12px;
		border-bottom: 1px solid var(--border);
		background: var(--muted);
	}
	.sample-label span {
		color: var(--muted-foreground);
		font-size: 11px;
	}
	.sample-label select {
		width: 100%;
	}
	.sample {
		display: flex;
		flex-direction: column;
		gap: 20px;
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
	.size-row {
		display: grid;
		grid-template-columns: repeat(2, auto);
		justify-content: center;
		align-items: center;
		gap: 12px 20px;
	}
	.size-pair {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.confirm {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px;
		font-size: 12px;
		line-height: 1.7;
	}
	.confirm ul {
		margin: 8px 0;
		padding-left: 18px;
		list-style: disc;
	}
	.confirm code,
	.tokens code {
		overflow-wrap: anywhere;
	}
	.help a {
		text-decoration: underline;
		color: var(--foreground);
	}
	.section-label {
		margin: 0 0 14px;
		padding: 0 8px;
	}
	.versions {
		border-top: 1px solid var(--border);
		padding: 16px;
		min-width: 0;
	}
	.versions .section-label {
		padding: 0;
	}
	.versions label {
		display: grid;
		gap: 8px;
		margin-bottom: 12px;
	}
	.actions {
		margin: 12px 0;
	}
	details {
		border-top: 1px solid var(--border);
		padding: 14px 0;
		margin-top: 14px;
	}
	summary {
		cursor: pointer;
		font-weight: 500;
	}
	dl {
		margin: 12px 0 0;
	}
	dl > div {
		margin-bottom: 10px;
	}
	dd {
		margin: 2px 0 0;
		overflow-wrap: anywhere;
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
	@media (max-width: 640px) {
		.comparing {
			margin: 12px;
		}
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
