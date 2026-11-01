<script lang="ts">
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { buttonVariants } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		label = "下一页",
		...restProps
	}: PaginationPrimitive.NextButtonProps & {
		/** Visible button text. */
		label?: string;
	} = $props();
</script>

<PaginationPrimitive.NextButton
	bind:ref
	aria-label="下一页"
	class={cn(buttonVariants({ variant: "ghost", size: "default" }), "cn-pagination-next", className)}
	{...restProps}
>
	<span class="cn-pagination-next-text hidden sm:block">{label}</span>
	<IconPlaceholder
		lucide="ChevronRightIcon"
		tabler="IconChevronRight"
		hugeicons="ArrowRight01Icon"
		phosphor="CaretRightIcon"
		remixicon="RiArrowRightSLine"
		data-icon="inline-end"
		class="cn-rtl-flip"
	/>
</PaginationPrimitive.NextButton>
