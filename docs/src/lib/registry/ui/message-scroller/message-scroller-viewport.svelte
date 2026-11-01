<script lang="ts">
	import { MessageScroller as MessageScrollerPrimitive } from "@valar/svelte-primitives/message-scroller";
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		ref = $bindable(null),
		"aria-label": ariaLabel = "消息",
		...restProps
	}: MessageScrollerPrimitive.ViewportProps = $props();
</script>

<MessageScrollerPrimitive.Viewport
	bind:ref
	data-slot="message-scroller-viewport"
	aria-label={ariaLabel}
	class={cn(
		"cn-message-scroller-viewport size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible",
		className
	)}
	{...restProps}
/>
