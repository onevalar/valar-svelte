<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		label = "更多页",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>> & {
		/** Screen reader text. */
		label?: string;
	} = $props();
</script>

<span
	bind:this={ref}
	aria-hidden="true"
	data-slot="pagination-ellipsis"
	class={cn("cn-pagination-ellipsis flex items-center justify-center", className)}
	{...restProps}
>
	<IconPlaceholder
		lucide="MoreHorizontalIcon"
		tabler="IconDots"
		hugeicons="MoreHorizontalCircle01Icon"
		phosphor="DotsThreeIcon"
		remixicon="RiMoreLine"
	/>
	<span class="sr-only">{label}</span>
</span>
