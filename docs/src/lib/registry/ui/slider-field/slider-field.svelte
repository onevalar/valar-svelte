<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	export type SliderFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		/** Visible label; also names the slider and the number input. */
		label: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		/** Shown after the number, e.g. "px". Not part of the value. */
		unit?: string;
		disabled?: boolean;
		/** Submitted by the number input as a plain number. */
		name?: string;
		onValueChange?: (value: number) => void;
	};
</script>

<script lang="ts">
	import { NumberField } from "$lib/registry/ui/number-field/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";
	import { cn } from "$lib/utils.js";

	let {
		label,
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		unit,
		disabled = false,
		name,
		onValueChange,
		id: idProp,
		class: className,
		...restProps
	}: SliderFieldProps = $props();
	const generated = $props.id();
	const id = $derived(idProp ?? generated);

	function set(next: number | undefined) {
		// An emptied or invalid number box keeps the last value instead of becoming 0.
		// Out-of-range typing is shown as invalid by the number box until it is corrected.
		if (next === undefined || !Number.isFinite(next) || next < min || next > max) return;
		if (Object.is(next, value)) return;
		value = next;
		onValueChange?.(next);
	}
</script>

<div
	data-slot="slider-field"
	data-disabled={disabled || undefined}
	class={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2", className)}
	{...restProps}
>
	<label for={`${id}-input`} class="col-span-2 text-sm font-medium">{label}</label>
	<Slider
		type="single"
		{value}
		onValueChange={set}
		{min}
		{max}
		{step}
		{disabled}
		aria-label={label}
	/>
	<div class="flex items-center gap-1.5">
		<NumberField
			id={`${id}-input`}
			{name}
			{value}
			onValueChange={set}
			{min}
			{max}
			{step}
			{disabled}
			class="w-32"
			decrementLabel={`减小${label}`}
			incrementLabel={`增大${label}`}
		/>
		{#if unit}<span class="text-xs text-muted-foreground">{unit}</span>{/if}
	</div>
</div>
