<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type NumberFieldProps = WithElementRef<
		Omit<
			HTMLInputAttributes,
			"value" | "defaultValue" | "type" | "min" | "max" | "step" | "children"
		>,
		HTMLInputElement
	> & {
		value?: number;
		defaultValue?: number;
		min?: number;
		max?: number;
		step?: number;
		locale?: string;
		formatOptions?: Intl.NumberFormatOptions;
		onValueChange?: (value: number | undefined) => void;
		decrementLabel?: string;
		incrementLabel?: string;
		invalidMessage?: string;
	};
</script>

<script lang="ts">
	import { NumberParser } from "@internationalized/number";
	import { onMount, untrack } from "svelte";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		defaultValue,
		value = $bindable<number | undefined>(defaultValue),
		min,
		max,
		step = 1,
		locale = "zh-CN",
		formatOptions,
		onValueChange,
		decrementLabel = "减小",
		incrementLabel = "增大",
		invalidMessage = "请输入有效的数字。",
		class: className,
		name,
		form,
		disabled = false,
		readonly = false,
		required = false,
		oninput,
		onblur,
		onkeydown,
		oncompositionstart,
		oncompositionend,
		...restProps
	}: NumberFieldProps = $props();

	const initialValue = untrack(() => value);
	const formatter = $derived(
		new Intl.NumberFormat(locale, {
			...(!formatOptions?.style || formatOptions.style === "decimal"
				? { maximumFractionDigits: 12 }
				: {}),
			...formatOptions,
		})
	);
	const parser = $derived(new NumberParser(locale, formatOptions));
	let text = $state(untrack(() => (value === undefined ? "" : formatter.format(value))));
	let lastValue: number | undefined = untrack(() => value);
	let lastFormatter = untrack(() => formatter);
	let composing = false;
	const parsed = $derived(text.trim() === "" ? undefined : parser.parse(text));
	const invalid = $derived(
		text.trim() !== "" && (parsed === undefined || !Number.isFinite(parsed))
	);
	const outOfRange = $derived(
		parsed !== undefined &&
			((min !== undefined && parsed < min) || (max !== undefined && parsed > max))
	);

	// Do not reformat an edit echoed through bind:value. External updates still win.
	$effect(() => {
		const next = value;
		const currentFormatter = formatter;
		untrack(() => {
			if (!Object.is(next, lastValue) || currentFormatter !== lastFormatter)
				text = next === undefined ? "" : currentFormatter.format(next);
			lastValue = next;
			lastFormatter = currentFormatter;
		});
	});
	$effect(() => {
		if (ref)
			ref.setCustomValidity(
				!disabled && !readonly && (invalid || outOfRange) ? invalidMessage : ""
			);
	});

	function update(next: number | undefined) {
		if (Object.is(value, next)) return;
		lastValue = next;
		value = next;
		onValueChange?.(next);
	}
	function edit() {
		if (composing || disabled || readonly) return;
		update(parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined);
	}
	function normalize(number: number) {
		const increment = Number.isFinite(step) && step > 0 ? step : 1;
		const base = min ?? 0;
		const snapped = base + Math.round((number - base) / increment) * increment;
		// Remove floating-point addition noise without implying arbitrary precision.
		const rounded = Number(snapped.toPrecision(15));
		return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded));
	}
	function commit() {
		if (composing || disabled || readonly) return;
		if (text.trim() === "") {
			update(undefined);
			return;
		}
		if (parsed === undefined || !Number.isFinite(parsed)) return;
		const next = normalize(parsed);
		text = formatter.format(next);
		update(parser.parse(text));
	}
	function spin(direction: number) {
		if (disabled || readonly || composing) return;
		const current = parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;
		const increment = Number.isFinite(step) && step > 0 ? step : 1;
		const base = min ?? 0;
		const position = ((current ?? base) - base) / increment;
		const grid =
			direction > 0
				? Math.floor(position + 1e-10) + direction
				: Math.ceil(position - 1e-10) + direction;
		const next = normalize(
			current === undefined ? (min ?? Math.min(0, max ?? 0)) : base + grid * increment
		);
		text = formatter.format(next);
		update(parser.parse(text));
		ref?.focus();
	}
	function keydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || event.isComposing || composing || disabled || readonly) return;
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			spin(event.key === "ArrowUp" ? 1 : -1);
		} else if (event.key === "PageUp" || event.key === "PageDown") {
			event.preventDefault();
			spin(event.key === "PageUp" ? 10 : -10);
		} else if (event.key === "Home" && min !== undefined) {
			event.preventDefault();
			update(min);
			text = formatter.format(min);
		} else if (event.key === "End" && max !== undefined) {
			event.preventDefault();
			update(max);
			text = formatter.format(max);
		} else if (event.key === "Enter") commit();
	}
	onMount(() => {
		const owner = ref?.form;
		let resetTimer: ReturnType<typeof setTimeout>;
		function reset(event: Event) {
			clearTimeout(resetTimer);
			// Native reset buttons may run microtasks before the browser resets input.value.
			resetTimer = setTimeout(() => {
				if (event.defaultPrevented) return;
				update(initialValue);
				text = initialValue === undefined ? "" : formatter.format(initialValue);
				// Reset also clears the DOM when the reactive value was already the initial value.
				if (ref) ref.value = text;
			}, 0);
		}
		owner?.addEventListener("reset", reset);
		return () => {
			clearTimeout(resetTimer);
			owner?.removeEventListener("reset", reset);
		};
	});
</script>

<div
	data-slot="number-field"
	data-disabled={disabled || undefined}
	class={cn(
		"flex min-h-10 w-full items-center rounded-md border border-input bg-background text-foreground shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 has-aria-invalid:border-destructive",
		className
	)}
>
	<button
		type="button"
		data-slot="number-field-decrement"
		aria-label={decrementLabel}
		disabled={disabled || readonly || (value !== undefined && min !== undefined && value <= min)}
		class="size-10 shrink-0 rounded-s-md text-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"
		onpointerdown={(event) => event.preventDefault()}
		onclick={() => spin(-1)}>−</button
	>
	<input
		{...restProps}
		bind:this={ref}
		type="text"
		role="spinbutton"
		inputmode="decimal"
		data-slot="number-field-input"
		class="h-10 w-full min-w-0 bg-transparent px-2 text-center text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
		{form}
		{disabled}
		{readonly}
		{required}
		value={text}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={text}
		aria-invalid={invalid || outOfRange || restProps["aria-invalid"] || undefined}
		oninput={(event) => {
			text = event.currentTarget.value;
			edit();
			oninput?.(event);
		}}
		onblur={(event) => {
			commit();
			onblur?.(event);
		}}
		onkeydown={keydown}
		oncompositionstart={(event) => {
			composing = true;
			oncompositionstart?.(event);
		}}
		oncompositionend={(event) => {
			composing = false;
			text = event.currentTarget.value;
			edit();
			oncompositionend?.(event);
		}}
	/>
	<button
		type="button"
		data-slot="number-field-increment"
		aria-label={incrementLabel}
		disabled={disabled || readonly || (value !== undefined && max !== undefined && value >= max)}
		class="size-10 shrink-0 rounded-e-md text-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"
		onpointerdown={(event) => event.preventDefault()}
		onclick={() => spin(1)}>+</button
	>
</div>
{#if name}
	<input type="hidden" {name} {form} {disabled} value={value ?? ""} />
{/if}
