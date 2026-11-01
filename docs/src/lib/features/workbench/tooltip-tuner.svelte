<script lang="ts">
	import { onMount, tick, type Snippet } from "svelte";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TOOLTIP_DELAY_VAR, TOOLTIP_SPEC } from "./tooltip-tuning.js";

	let { children }: { children: Snippet } = $props();
	// Pinned tooltips show the style at rest; flags are per pane so replay restarts the animation.
	let open = $state({ current: false, before: false });
	// Hover samples use each pane's delay, which the editor's preview CSS exposes as a variable.
	let delay = $state({ current: 0, before: 0 });

	function readDelays() {
		for (const pane of ["current", "before"] as const) {
			const element = document.querySelector(`[data-tuning-${pane}] [data-tooltip-hover]`);
			if (element)
				delay[pane] = Number(getComputedStyle(element).getPropertyValue(TOOLTIP_DELAY_VAR)) || 0;
		}
	}
	onMount(() => {
		// The editor swaps its preview stylesheet on every change; read the delay again then.
		const observer = new MutationObserver(readDelays);
		observer.observe(document.head, { childList: true });
		return () => observer.disconnect();
	});

	// Opening before the trigger is mounted leaves the tooltip unpositioned; open once it exists.
	function pin(_node: HTMLElement, pane: "current" | "before") {
		const frame = requestAnimationFrame(() => (open[pane] = true));
		return {
			destroy() {
				cancelAnimationFrame(frame);
				open[pane] = false;
			},
		};
	}

	function keepOpen(pane: "current" | "before", value: boolean) {
		if (value) open[pane] = true;
	}

	async function replay(pane: "current" | "before") {
		open[pane] = false;
		const content = document.querySelector<HTMLElement>(
			`[data-tuning-${pane}] [data-tooltip-pinned] [data-slot="tooltip-content"]`
		);
		const duration = content ? parseFloat(getComputedStyle(content).animationDuration) * 1000 : 0;
		await new Promise((resolve) => setTimeout(resolve, duration + 120));
		open[pane] = true;
		await tick();
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="flex items-center justify-end gap-2 border-b px-4 py-2">
		<Button size="sm" variant="outline" onclick={() => replay(pane)}>重播进入与退出</Button>
	</div>
	<!--
		Real Tooltips rendered inline (no portal) so the pane's preview CSS reaches them. Each
		sample has its own Provider: one open tooltip would otherwise close the other and skip
		the hover sample's delay.
	-->
	<div class="tooltip-canvas">
		<div class="sample" data-tooltip-pinned use:pin={pane}>
			<Tooltip.Provider>
				<!-- Ignores closes from Bits (any scroll around the trigger closes a tooltip); only replay closes it. -->
				<Tooltip.Root bind:open={() => open[pane], (value) => keepOpen(pane, value)}>
					<Tooltip.Trigger class={buttonVariants({ variant: "outline" })} tabindex={-1}
						>固定展开</Tooltip.Trigger
					>
					<Tooltip.Content
						portalProps={{ disabled: true }}
						escapeKeydownBehavior="defer-otherwise-ignore"
						interactOutsideBehavior="ignore"
					>
						添加到资料库
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
		<div
			class="sample"
			data-tooltip-hover
			role="group"
			onfocusin={readDelays}
			onpointerover={readDelays}
		>
			<Tooltip.Provider delayDuration={delay[pane]}>
				<Tooltip.Root>
					<Tooltip.Trigger class={buttonVariants({ variant: "outline" })}>悬停试试</Tooltip.Trigger>
					<Tooltip.Content portalProps={{ disabled: true }}>
						显示延迟 {delay[pane]}ms
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
			<p class="text-xs text-muted-foreground">悬停或聚焦后 {delay[pane]}ms 出现</p>
		</div>
	</div>
{/snippet}

<ComponentTuner spec={TOOLTIP_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.tooltip-canvas {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		gap: 48px 64px;
		min-height: 260px;
		padding: 72px 16px 32px;
	}
	.sample {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	/* The pinned sample stays open: pointer and focus never reach its trigger. */
	[data-tooltip-pinned] {
		pointer-events: none;
	}
</style>
