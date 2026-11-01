<script lang="ts">
	import * as Select from "$lib/registry/ui/select/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_SIZES } from "./button-tuning.js";
	import { SELECT_SIZES, SELECT_SPEC } from "./select-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const fruits = [
		{ value: "apple", label: "苹果" },
		{ value: "banana", label: "香蕉" },
		{ value: "grapes", label: "葡萄" },
	];
</script>

{#snippet probe()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-button={size.id}>{size.label}</Button>
	{/each}
	{#each SELECT_SIZES as size (size.id)}
		<Select.Root type="single" items={fruits} value="apple">
			<Select.Trigger size={size.id}><Select.Value /></Select.Trigger>
		</Select.Root>
	{/each}
{/snippet}

{#snippet field(
	size: "default" | "sm",
	label: string,
	value: string,
	state?: "disabled" | "invalid"
)}
	<Select.Root type="single" items={fruits} {value} disabled={state === "disabled"}>
		<Select.Trigger
			{size}
			aria-label={label}
			aria-invalid={state === "invalid" ? "true" : undefined}
			class="w-36"
		>
			<Select.Value placeholder="选择水果" />
		</Select.Trigger>
		<Select.Content>
			{#each fruits as fruit (fruit.value)}
				<Select.Item value={fruit.value} label={fruit.label}>{fruit.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
{/snippet}

{#snippet canvas()}
	<div class="grid gap-6 p-4 md:p-6">
		{#each SELECT_SIZES as size (size.id)}
			<div class="grid gap-2">
				<span class="text-xs text-muted-foreground"
					>{size.label}尺寸 · 与同名尺寸的 Button 并排</span
				>
				<div class="flex flex-wrap items-center gap-2">
					{@render field(size.id, `${size.label}尺寸 · 占位`, "")}
					{@render field(size.id, `${size.label}尺寸 · 已选`, "banana")}
					{@render field(size.id, `${size.label}尺寸 · 禁用`, "apple", "disabled")}
					{@render field(size.id, `${size.label}尺寸 · 错误`, "", "invalid")}
					<Button variant="outline" size={size.id}>同档按钮</Button>
				</div>
			</div>
		{/each}
	</div>
{/snippet}

<ComponentTuner spec={SELECT_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>
