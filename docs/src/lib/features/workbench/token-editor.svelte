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
	import { BASE_THEMES, UPSTREAM_BASE_THEMES } from "$lib/registry/themes.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { ColorPicker } from "$lib/registry/ui/color-picker/index.js";
	import { NativeSelect, NativeSelectOption } from "$lib/registry/ui/native-select/index.js";
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";
	import {
		BASE_THEME_NAMES,
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
	const SECTION_LABELS = { light: "浅色", dark: "深色", theme: "字号" } as const;

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
	const upstream = $derived(read(UPSTREAM_BASE_THEMES, base));
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
				这里的修改会影响所有组件。已修改 {changes.length} 项；与上游相比共 {fromUpstream} 项不同。
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
					onclick={() => (draft = read(UPSTREAM_BASE_THEMES, base))}>恢复上游</Button
				>
			</div>
			{#if !canWrite}
				<p class="text-xs text-muted-foreground">写回仅在本地开发服务器中可用。</p>
			{/if}
			<p role="status" class="text-xs text-muted-foreground empty:hidden">{message}</p>
		</div>
	</aside>

	<div class="valar-token-preview min-w-0 theme-container">
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
					<Badge variant="secondary">{SECTION_LABELS[change.section]}</Badge>
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
