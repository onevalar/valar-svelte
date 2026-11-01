<!--
	Global token editor for `/themes`. Edits one base theme's colors (light and dark separately),
	`--radius` and the type scale, previews them live inside `.valar-token-preview`, and in dev
	writes the differences from upstream to `styles/valar/tokens.json`. Component pages only link
	here; they never edit global tokens.
-->
<script lang="ts">
	import { mode, setMode } from "mode-watcher";
	import { onMount, untrack, type Snippet } from "svelte";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { BASE_THEMES, DEFAULT_BASE_THEMES } from "$lib/registry/themes.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { ColorPicker } from "$lib/registry/ui/color-picker/index.js";
	import { NativeSelect, NativeSelectOption } from "$lib/registry/ui/native-select/index.js";
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";
	import {
		BASE_THEME_NAMES,
		COLOR_TOKENS,
		DURATION_TOKENS,
		EASE_TOKENS,
		TOKEN_OVERRIDE_PATH,
		TYPE_SCALE_DEFAULTS,
		TYPE_TOKENS,
		diffTokens,
		hexToOklch,
		oklchToHex,
		parseOklch,
		type ColorToken,
	} from "./token-overrides.js";

	let { children }: { children: Snippet } = $props();

	const canWrite = import.meta.env.DEV;
	const FLASH_KEY = "valar.token-writeback.flash";
	type Base = (typeof BASE_THEME_NAMES)[number];
	type Draft = {
		light: Record<string, string>;
		dark: Record<string, string>;
		theme: Record<string, string>;
	};

	const GROUPS: { label: string; tokens: ColorToken[] }[] = [
		{
			label: "页面与表面",
			tokens: [
				"background",
				"foreground",
				"card",
				"card-foreground",
				"popover",
				"popover-foreground",
			],
		},
		{
			label: "主次与强调",
			tokens: [
				"primary",
				"primary-foreground",
				"secondary",
				"secondary-foreground",
				"muted",
				"muted-foreground",
				"accent",
				"accent-foreground",
				"destructive",
			],
		},
		{ label: "边框与焦点", tokens: ["border", "input", "ring"] },
		{ label: "图表", tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] },
		{
			label: "侧边栏",
			tokens: [
				"sidebar",
				"sidebar-foreground",
				"sidebar-primary",
				"sidebar-primary-foreground",
				"sidebar-accent",
				"sidebar-accent-foreground",
				"sidebar-border",
				"sidebar-ring",
			],
		},
	];
	const TYPE_LABELS: Record<string, string> = {
		"text-xs": "极小字 text-xs",
		"text-sm": "小字 text-sm",
		"text-base": "正文 text-base",
		"text-lg": "大字 text-lg",
		"text-xl": "标题 text-xl",
	};
	const DURATION_LABELS: Record<string, string> = {
		"motion-duration-fast": "快：提示、菜单、弹窗",
		"motion-duration-normal": "中：侧边面板、展开",
		"motion-duration-slow": "慢：大范围位移",
		"motion-duration-interaction": "交互反馈：悬停、按下",
	};
	const EASE_LABELS: Record<string, string> = {
		"motion-ease-enter": "进入曲线",
		"motion-ease-exit": "退出曲线",
		"motion-ease-standard": "标准曲线（含交互反馈）",
	};
	const EASE_PRESETS: [string, string][] = [
		["cubic-bezier(0.22, 1, 0.36, 1)", "快出慢停（默认进入）"],
		["cubic-bezier(0.16, 1, 0.3, 1)", "更柔和的快出慢停"],
		["cubic-bezier(0.34, 1.56, 0.64, 1)", "轻微回弹"],
		["cubic-bezier(0.7, 0, 0.84, 0)", "慢起快走（默认退出）"],
		["cubic-bezier(0.4, 0, 1, 1)", "加速离开"],
		["cubic-bezier(0.4, 0, 0.2, 1)", "标准（默认）"],
		["linear", "匀速"],
	];
	const COLOR_SET = new Set<string>(COLOR_TOKENS);
	// Motion, border width and radius live in `light` but apply to both schemes.
	const sectionLabel = (section: "light" | "dark" | "theme", token: string) =>
		section === "theme"
			? "字号"
			: section === "dark"
				? "深色"
				: COLOR_SET.has(token)
					? "浅色"
					: "通用";
	const toMs = (value: string | undefined) => Number.parseInt(value ?? "0");
	const MOTION_ROWS = [
		["快", "duration-fast"],
		["中", "duration-normal"],
		["慢", "duration-slow"],
	] as const;
	let played = $state(false);

	const read = (list: readonly { name: string; cssVars?: unknown }[], base: Base): Draft => {
		const vars = list.find((theme) => theme.name === base)?.cssVars as Partial<Draft> | undefined;
		return {
			light: { ...vars?.light },
			dark: { ...vars?.dark },
			theme: { ...TYPE_SCALE_DEFAULTS, ...vars?.theme },
		};
	};

	let base = $state<Base>("neutral");
	let scheme = $state<"light" | "dark">("light");
	// Upstream values plus Valar's motion and border defaults; `tokens.json` stores differences.
	const upstream = $derived(read(DEFAULT_BASE_THEMES, base));
	// What the library currently ships: upstream plus `tokens.json`.
	const saved = $derived(read(BASE_THEMES, base));
	let draft = $state<Draft>(untrack(() => read(BASE_THEMES, "neutral")));
	let confirming = $state(false);
	let writing = $state(false);
	let message = $state("");

	const sections = ["light", "dark", "theme"] as const;
	const changes = $derived(
		sections.flatMap((section) =>
			diffTokens(saved[section], draft[section]).map((change) => ({ section, ...change }))
		)
	);
	const fromUpstream = $derived(
		sections.reduce(
			(count, section) => count + diffTokens(upstream[section], draft[section]).length,
			0
		)
	);

	function selectBase(next: Base) {
		if (changes.length && !confirm("切换基础主题会丢弃尚未写回的修改，继续吗？")) return;
		base = next;
		draft = read(BASE_THEMES, next);
	}

	function selectScheme(next: "light" | "dark") {
		scheme = next;
		// Preview follows the scheme being edited so every change is visible.
		setMode(next);
	}

	onMount(() => {
		scheme = mode.current === "dark" ? "dark" : "light";
		message = sessionStorage.getItem(FLASH_KEY) ?? "";
		sessionStorage.removeItem(FLASH_KEY);
	});

	function setColor(token: ColorToken, hex: string) {
		const alpha = parseOklch(draft[scheme][token] ?? "")?.alpha;
		draft[scheme][token] = hexToOklch(hex, alpha);
	}

	const toPx = (value: string | undefined) => Math.round(Number.parseFloat(value ?? "0") * 16);
	const toRem = (px: number) => `${Number((px / 16).toFixed(4))}rem`;

	const declarations = (vars: Record<string, string>) =>
		Object.entries(vars)
			.map(([key, value]) => `--${key}: ${value};`)
			.join(" ");
	// Doubled class beats `.theme-container` rules from the theme picker on other pages.
	const css = $derived(
		`.valar-token-preview.valar-token-preview { ${declarations(draft.light)} ${declarations(draft.theme)} }\n` +
			`.dark .valar-token-preview.valar-token-preview { ${declarations(draft.dark)} }`
	);

	/** Only values that differ from upstream go into `tokens.json`. */
	function overridePayload() {
		const pick = (section: (typeof sections)[number]) =>
			Object.fromEntries(
				diffTokens(upstream[section], draft[section]).map(({ token, to }) => [token, to])
			);
		return { light: pick("light"), dark: pick("dark"), theme: pick("theme") };
	}

	function cssCode() {
		const block = (selector: string, vars: Record<string, string>) =>
			`${selector} {\n${Object.entries(vars)
				.map(([key, value]) => `\t--${key}: ${value};`)
				.join("\n")}\n}`;
		return [
			block(":root", draft.light),
			block(".dark", draft.dark),
			block("@theme inline", draft.theme),
		].join("\n\n");
	}

	async function copyCss() {
		try {
			await navigator.clipboard.writeText(cssCode());
			message = "已复制当前草稿的 CSS 变量。";
		} catch {
			message = "复制失败：浏览器未允许访问剪贴板。";
		}
	}

	async function writeBack() {
		writing = true;
		message = "正在写回并重建 registry，约需 10 秒…";
		try {
			const response = await fetch("/__valar/token-overrides", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ base, override: overridePayload() }),
			});
			const body = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
			sessionStorage.setItem(
				FLASH_KEY,
				`已写回 ${body.file}，${base} 主题的全局 token 已更新，registry 已重建。改动尚未提交到 Git。`
			);
			location.reload();
		} catch (error) {
			message = `写回失败：${error instanceof Error ? error.message : "未知错误"}。草稿仍保留。`;
			writing = false;
		}
	}
</script>

<svelte:head>
	<!-- Values come from the color picker / sliders after validation into oklch()/rem strings. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<style>${css}</style>`}
</svelte:head>

<div class="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
	<aside
		aria-label="全局 token"
		class="flex flex-col gap-5 rounded-xl border bg-background p-4 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto"
	>
		<div class="grid gap-3">
			<label class="grid gap-1.5 text-sm font-medium"
				>基础主题
				<NativeSelect
					value={base}
					onchange={(event) => selectBase(event.currentTarget.value as Base)}
				>
					{#each BASE_THEME_NAMES as name (name)}
						<NativeSelectOption value={name}>{name}</NativeSelectOption>
					{/each}
				</NativeSelect>
			</label>
			<p class="text-xs text-muted-foreground">
				这里的修改会影响所有组件。已修改 {changes.length} 项；与默认值相比共 {fromUpstream} 项不同。
			</p>
		</div>

		<section class="grid gap-3" aria-labelledby="token-radius">
			<h2 id="token-radius" class="text-sm font-semibold">圆角与字号</h2>
			<SliderField
				label="基础圆角 --radius"
				unit="px"
				min={0}
				max={32}
				value={toPx(draft.light.radius)}
				onValueChange={(px) => (draft.light.radius = toRem(px))}
			/>
			{#each TYPE_TOKENS as token (token)}
				<SliderField
					label={TYPE_LABELS[token] ?? token}
					unit="px"
					min={8}
					max={32}
					value={toPx(draft.theme[token])}
					onValueChange={(px) => (draft.theme[token] = toRem(px))}
				/>
			{/each}
		</section>

		<section class="grid gap-3" aria-labelledby="token-motion">
			<h2 id="token-motion" class="text-sm font-semibold">动效与边框</h2>
			<p class="text-xs text-muted-foreground">
				组件只选用档位；这里决定每档多快、按什么曲线变化。系统开启“减少动态效果”时，快、中、慢三档自动变为瞬时。
			</p>
			{#each DURATION_TOKENS as token (token)}
				<SliderField
					label={DURATION_LABELS[token] ?? token}
					unit="ms"
					min={0}
					max={1000}
					step={10}
					value={toMs(draft.light[token])}
					onValueChange={(value) => (draft.light[token] = `${value}ms`)}
				/>
			{/each}
			{#each EASE_TOKENS as token (token)}
				{@const value = draft.light[token] ?? ""}
				<label class="grid gap-1.5 text-sm font-medium"
					>{EASE_LABELS[token] ?? token}
					<NativeSelect
						{value}
						onchange={(event) => (draft.light[token] = event.currentTarget.value)}
					>
						{#if !EASE_PRESETS.some(([preset]) => preset === value)}
							<NativeSelectOption {value}>{value}</NativeSelectOption>
						{/if}
						{#each EASE_PRESETS as [preset, label] (preset)}
							<NativeSelectOption value={preset}>{label}</NativeSelectOption>
						{/each}
					</NativeSelect>
				</label>
			{/each}
			<SliderField
				label="边框粗细 --border-width"
				unit="px"
				min={0}
				max={4}
				step={0.5}
				value={Number.parseFloat(draft.light["border-width"] ?? "1")}
				onValueChange={(value) => (draft.light["border-width"] = `${value}px`)}
			/>
		</section>

		<section class="grid gap-3" aria-labelledby="token-colors">
			<div class="flex items-center justify-between gap-2">
				<h2 id="token-colors" class="text-sm font-semibold">颜色</h2>
				<ToggleGroup.Root
					type="single"
					variant="outline"
					size="sm"
					value={scheme}
					onValueChange={(value) => value && selectScheme(value as "light" | "dark")}
					aria-label="编辑的配色"
				>
					<ToggleGroup.Item value="light">浅色</ToggleGroup.Item>
					<ToggleGroup.Item value="dark">深色</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>
			{#each GROUPS as group (group.label)}
				<fieldset class="grid gap-2">
					<legend class="mb-1 text-xs text-muted-foreground">{group.label}</legend>
					<div class="grid grid-cols-2 gap-2">
						{#each group.tokens as token (token)}
							{@const value = draft[scheme][token] ?? ""}
							{@const alpha = parseOklch(value)?.alpha}
							<ColorPicker
								class="min-w-0 [&>span]:truncate [&>span]:text-xs"
								label={alpha ? `${token}（透明 ${alpha}）` : token}
								value={oklchToHex(value) ?? "#000000"}
								onValueChange={(hex) => setColor(token, hex)}
							/>
						{/each}
					</div>
				</fieldset>
			{/each}
		</section>

		<div class="sticky bottom-0 -mx-4 -mb-4 grid gap-2 border-t bg-background p-4">
			<div class="flex flex-wrap gap-2">
				{#if canWrite}
					<Button size="sm" disabled={!changes.length} onclick={() => (confirming = true)}
						>写回组件库</Button
					>
				{/if}
				<Button size="sm" variant="outline" onclick={copyCss}>复制 CSS</Button>
				<Button
					size="sm"
					variant="ghost"
					disabled={!changes.length}
					onclick={() => (draft = read(BASE_THEMES, base))}>撤销修改</Button
				>
				<Button
					size="sm"
					variant="ghost"
					disabled={!fromUpstream}
					onclick={() => (draft = read(DEFAULT_BASE_THEMES, base))}>恢复默认</Button
				>
			</div>
			{#if !canWrite}
				<p class="text-xs text-muted-foreground">写回仅在本地开发服务器中可用。</p>
			{/if}
			<p role="status" class="text-xs text-muted-foreground empty:hidden">{message}</p>
		</div>
	</aside>

	<div class="valar-token-preview flex min-w-0 flex-col gap-4 theme-container">
		<section
			aria-labelledby="motion-preview"
			class="grid gap-3 rounded-xl border bg-card p-4 text-card-foreground"
		>
			<div class="flex items-center justify-between gap-2">
				<h2 id="motion-preview" class="text-sm font-medium">动效预览</h2>
				<Button size="sm" variant="outline" aria-pressed={played} onclick={() => (played = !played)}
					>{played ? "收回（退出曲线）" : "播放（进入曲线）"}</Button
				>
			</div>
			{#each MOTION_ROWS as [label, duration] (label)}
				<div class="flex items-center gap-3 text-xs">
					<span class="w-6 text-muted-foreground">{label}</span>
					<div class="relative h-6 flex-1 rounded-md border bg-muted">
						<div
							data-slot="motion-preview-dot"
							class={[
								"absolute top-1/2 size-4 -translate-y-1/2 rounded-sm bg-primary transition-[left]",
								duration,
								played ? "left-[calc(100%-1.25rem)] ease-enter" : "left-1 ease-exit",
							]}
						></div>
					</div>
				</div>
			{/each}
		</section>
		{@render children()}
	</div>
</div>

<AlertDialog.Root bind:open={confirming}>
	<AlertDialog.Content class="sm:max-w-lg">
		<AlertDialog.Header>
			<AlertDialog.Title>写回全局 token</AlertDialog.Title>
			<AlertDialog.Description>
				将写入 <code>docs/{TOKEN_OVERRIDE_PATH}</code> 并重建 registry。这会影响所有组件；以后用
				<code>{base}</code> 主题初始化的项目都会使用以下值：
			</AlertDialog.Description>
		</AlertDialog.Header>
		<ul class="grid max-h-64 gap-1 overflow-y-auto text-xs">
			{#each changes as change (change.section + change.token)}
				<li class="flex flex-wrap items-center gap-1.5">
					<Badge variant="secondary">{sectionLabel(change.section, change.token)}</Badge>
					<code>{change.token}</code>
					<span class="text-muted-foreground">{change.from || "（无）"} → {change.to}</span>
				</li>
			{/each}
		</ul>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={writing}>返回修改</AlertDialog.Cancel>
			<AlertDialog.Action onclick={writeBack} disabled={writing}
				>{writing ? "写回中…" : "确认写回"}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
