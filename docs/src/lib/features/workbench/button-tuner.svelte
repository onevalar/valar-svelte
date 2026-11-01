<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_SIZES, BUTTON_SPEC } from "./button-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const VARIANTS = [
		{ id: "default", label: "默认" },
		{ id: "outline", label: "描边" },
		{ id: "secondary", label: "次要" },
		{ id: "ghost", label: "幽灵" },
		{ id: "destructive", label: "危险" },
		{ id: "link", label: "链接" },
	] as const;
</script>

{#snippet probe()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-size={size.id}>{size.label}</Button>
	{/each}
{/snippet}

{#snippet canvas()}
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
{/snippet}

<ComponentTuner spec={BUTTON_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>

<style>
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
</style>
