<script lang="ts">
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import { buttonVariants } from "../button/index.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		label = "下一页",
		...restProps
	}: PaginationPrimitive.NextButtonProps & {
		/** Visible button text. */
		label?: string;
	} = $props();
</script>

{#snippet Fallback()}
	<span>{label}</span>
	<IconPlaceholder
		lucide="ChevronRightIcon"
		tabler="IconChevronRight"
		hugeicons="ArrowRightIcon"
		phosphor="CaretRightIcon"
		remixicon="RiArrowRightSLine"
		class={cn("cn-rtl-flip size-4", className)}
	/>
{/snippet}

<PaginationPrimitive.NextButton
	bind:ref
	aria-label="下一页"
	class={cn(buttonVariants({ variant: "ghost" }), "cn-pagination-next", className)}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{@render Fallback()}
	{/if}
</PaginationPrimitive.NextButton>
