<script lang="ts">
	import ButtonTuner from "$lib/features/workbench/button-tuner.svelte";
	import DialogTuner from "$lib/features/workbench/dialog-tuner.svelte";
	import DropdownMenuTuner from "$lib/features/workbench/dropdown-menu-tuner.svelte";
	import InputTuner from "$lib/features/workbench/input-tuner.svelte";
	import PopoverTuner from "$lib/features/workbench/popover-tuner.svelte";
	import SelectTuner from "$lib/features/workbench/select-tuner.svelte";
	import SheetTuner from "$lib/features/workbench/sheet-tuner.svelte";
	import TextareaTuner from "$lib/features/workbench/textarea-tuner.svelte";
	import TooltipTuner from "$lib/features/workbench/tooltip-tuner.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import type { PresetConfig } from "@valar/svelte-cli/preset";
	import type { Component, Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		class: className,
		previewClassName,
		align = "center",
		component,
		example,
		children,
		name,
		hideCode = false,
		chromeLessOnMobile = false,
		previewStyle,
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		previewClassName?: string;
		align?: "center" | "start" | "end";
		hideCode?: boolean;
		chromeLessOnMobile?: boolean;
		previewStyle?: PresetConfig["style"];
		example?: Snippet;
		component?: Component;
		name: string;
	} = $props();

	let codeVisible = $state(false);
</script>

{#snippet ExampleFallback()}
	{#if component}
		{@const Component = component}
		<Component />
	{:else}
		<p class="text-sm text-muted-foreground">
			{t("docs.componentNotFound", { name })}
		</p>
	{/if}
{/snippet}

{#snippet PreviewExample()}
	{#if example}
		{@render example()}
	{:else}
		{@render ExampleFallback()}
	{/if}
{/snippet}

<div
	data-slot="component-preview"
	class={cn(
		"group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-2xl border",
		className
	)}
	{...restProps}
>
	<div data-slot="preview" data-llm-ignore>
		<div
			data-align={align}
			data-chromeless={chromeLessOnMobile}
			class={cn(
				"preview relative flex min-h-72 w-full min-w-0 justify-center overflow-x-auto p-4 data-[align=center]:items-center data-[align=end]:items-start data-[align=start]:items-start data-[chromeless=true]:h-auto data-[chromeless=true]:p-0 sm:p-10 sm:data-[align=end]:items-end",
				previewStyle && `style-${previewStyle}`,
				previewClassName,
				["input-demo", "select-demo", "textarea-demo"].includes(name) && "p-0 sm:p-0",
				(name === "button-demo" || name === "dialog-demo") && "p-0 sm:p-0",
				(name === "popover-demo" || name === "sheet-demo") && "p-0 sm:p-0",
				(name === "dropdown-menu-demo" || name === "tooltip-demo") && "p-0 sm:p-0"
			)}
		>
			{#if name === "button-demo"}
				<ButtonTuner>{@render PreviewExample()}</ButtonTuner>
			{:else if name === "dialog-demo"}
				<DialogTuner>{@render PreviewExample()}</DialogTuner>
			{:else if name === "popover-demo"}
				<PopoverTuner>{@render PreviewExample()}</PopoverTuner>
			{:else if name === "sheet-demo"}
				<SheetTuner>{@render PreviewExample()}</SheetTuner>
			{:else if name === "input-demo"}
				<InputTuner>{@render PreviewExample()}</InputTuner>
			{:else if name === "select-demo"}
				<SelectTuner>{@render PreviewExample()}</SelectTuner>
			{:else if name === "textarea-demo"}
				<TextareaTuner>{@render PreviewExample()}</TextareaTuner>
			{:else if name === "dropdown-menu-demo"}
				<DropdownMenuTuner>{@render PreviewExample()}</DropdownMenuTuner>
			{:else if name === "tooltip-demo"}
				<TooltipTuner>{@render PreviewExample()}</TooltipTuner>
			{:else}
				{@render PreviewExample()}
			{/if}
		</div>
	</div>
	{#if !hideCode}
		<div
			data-slot="code"
			data-code-visible={codeVisible}
			class="relative overflow-hidden **:data-rehype-pretty-code-figure:m-0! **:data-rehype-pretty-code-figure:rounded-t-none **:data-rehype-pretty-code-figure:border-t data-[code-visible=false]:**:data-rehype-pretty-code-figure:max-h-28 data-[code-visible=false]:**:data-rehype-pretty-code-figure:overflow-hidden **:data-[slot=copy-button]:right-4 **:data-[slot=copy-button]:hidden data-[code-visible=true]:**:data-[slot=copy-button]:flex data-[code-visible=true]:[&_pre]:max-h-72"
		>
			{@render children?.()}
			{#if !codeVisible}
				<div class="absolute inset-0 flex items-center justify-center pb-4">
					<div
						class="absolute inset-0"
						style="background: linear-gradient(to top, var(--color-code), color-mix(in oklab, var(--color-code) 60%, transparent), transparent)"
					></div>
					<Button
						type="button"
						size="sm"
						variant="outline"
						class="relative z-10 rounded-lg bg-background text-foreground shadow-none hover:bg-muted dark:bg-background dark:text-foreground dark:hover:bg-muted"
						onclick={() => {
							codeVisible = true;
						}}
					>
						{t("docs.viewCode")}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>
