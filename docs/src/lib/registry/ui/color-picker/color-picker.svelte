<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		/** Visible label; also names the trigger and the inputs. */
		label: string;
		/** Six-digit hex color such as `#1e40af`. Shorthand input is expanded. */
		value?: string;
		/** Optional swatches offered for one-click selection. */
		presets?: string[];
		disabled?: boolean;
		/** Submitted as the six-digit hex value. */
		name?: string;
		onValueChange?: (value: string) => void;
	};

	const HEX = /^#?([\da-f]{3}|[\da-f]{6})$/i;

	/** Returns a lowercase `#rrggbb`, or undefined for anything that is not a 3/6-digit hex. */
	export function normalizeHex(input: string): string | undefined {
		const match = HEX.exec(input.trim());
		if (!match) return undefined;
		const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join("") : match[1]!;
		return `#${digits.toLowerCase()}`;
	}
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { cn } from "$lib/utils.js";

	let {
		label,
		value = $bindable("#000000"),
		presets = [],
		disabled = false,
		name,
		onValueChange,
		id: idProp,
		class: className,
		...restProps
	}: ColorPickerProps = $props();
	const generated = $props.id();
	const id = $derived(idProp ?? generated);
	const current = $derived(normalizeHex(value) ?? "#000000");
	let text = $state("");
	let open = $state(false);
	// Partial input such as "#1e" is still being typed; only impossible characters are errors.
	const invalid = $derived(!/^#?[\da-f]{0,6}$/i.test(text.trim()));

	$effect(() => {
		// Opening resets the text box to the real value.
		if (open) text = untrack(() => current);
	});

	function set(next: string | undefined) {
		if (!next || next === current) return;
		value = next;
		onValueChange?.(next);
	}
	function commitText() {
		set(normalizeHex(text));
		text = current;
	}
</script>

<div
	data-slot="color-picker"
	data-disabled={disabled || undefined}
	class={cn("grid gap-2", className)}
	{...restProps}
>
	<span id={`${id}-label`} class="text-sm font-medium">{label}</span>
	<Popover.Root bind:open>
		<Popover.Trigger
			{disabled}
			aria-labelledby={`${id}-label ${id}-value`}
			class="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-2 text-sm shadow-xs outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
		>
			<span
				data-slot="color-picker-swatch"
				class="size-5 shrink-0 rounded-sm border"
				style:background={current}
			></span>
			<span id={`${id}-value`} class="font-mono text-xs">{current}</span>
		</Popover.Trigger>
		<Popover.Content class="grid w-64 gap-3" aria-label={label}>
			<input
				type="color"
				aria-label={`${label}：色盘`}
				value={current}
				oninput={(event) => {
					set(normalizeHex(event.currentTarget.value));
					text = current;
				}}
				class="h-28 w-full cursor-pointer rounded-md border bg-transparent p-0"
			/>
			<label class="grid gap-1 text-xs text-muted-foreground"
				>十六进制
				<input
					type="text"
					aria-label={`${label}：十六进制`}
					aria-invalid={invalid || undefined}
					spellcheck="false"
					autocomplete="off"
					maxlength={7}
					bind:value={text}
					oninput={() => {
						// Apply full six-digit values live; shorthand applies on Enter or blur.
						if (/^#?[\da-f]{6}$/i.test(text.trim())) set(normalizeHex(text));
					}}
					onkeydown={(event) => {
						if (event.key === "Enter") commitText();
					}}
					onblur={commitText}
					class="h-8 rounded-md border border-input bg-background px-2 font-mono text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
				/>
			</label>
			{#if invalid}<p class="text-xs text-destructive">
					只能输入十六进制字符 0-9、a-f，如 #1e40af。
				</p>{/if}
			{#if presets.length}
				<div role="group" aria-label={`${label}：预设`} class="flex flex-wrap gap-1.5">
					{#each presets as preset (preset)}
						{@const hex = normalizeHex(preset)}
						{#if hex}
							<button
								type="button"
								aria-label={hex}
								aria-pressed={hex === current}
								class="size-6 rounded-sm border outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:ring-2 aria-pressed:ring-foreground"
								style:background={hex}
								onclick={() => {
									set(hex);
									text = current;
								}}
							></button>
						{/if}
					{/each}
				</div>
			{/if}
		</Popover.Content>
	</Popover.Root>
	{#if name}<input type="hidden" {name} value={current} {disabled} />{/if}
</div>
