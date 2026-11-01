<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { POPOVER_SPEC } from "./popover-tuning.js";

	let { children }: { children: Snippet } = $props();
	// One flag per pane; closing and reopening replays the exit and enter animations.
	let open = $state({ current: true, before: true });
	// Preview-only: the slide direction depends on the side the panel opens on.
	let side = $state<"bottom" | "top" | "left" | "right">("bottom");
	const SIDES = [
		["bottom", "下方"],
		["top", "上方"],
		["left", "左侧"],
		["right", "右侧"],
	] as const;

	async function replay(pane: "current" | "before") {
		open[pane] = false;
		const content = document.querySelector<HTMLElement>(
			`[data-tuning-${pane}] [data-slot="popover-content"]`
		);
		const duration = content ? parseFloat(getComputedStyle(content).animationDuration) * 1000 : 0;
		await new Promise((resolve) => setTimeout(resolve, duration + 120));
		open[pane] = true;
		await tick();
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="flex flex-wrap items-center justify-end gap-2 border-b px-4 py-2">
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			value={side}
			onValueChange={(value) => value && (side = value as typeof side)}
			aria-label="弹出方向"
		>
			{#each SIDES as [value, label] (value)}
				<ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
		<Button size="sm" variant="outline" onclick={() => replay(pane)}>重播进入与退出</Button>
	</div>
	<!--
		A real Popover rendered inline next to its trigger: no portal or focus trap, ignores
		outside clicks and lets Escape reach the editor.
	-->
	<div class="popover-canvas" data-side={side}>
		<Popover.Root bind:open={open[pane]}>
			<Popover.Trigger class={buttonVariants({ variant: "outline" })}>打开浮层</Popover.Trigger>
			<Popover.Content
				{side}
				avoidCollisions={false}
				portalProps={{ disabled: true }}
				trapFocus={false}
				interactOutsideBehavior="ignore"
				escapeKeydownBehavior="defer-otherwise-ignore"
				onOpenAutoFocus={(event) => event.preventDefault()}
				onCloseAutoFocus={(event) => event.preventDefault()}
			>
				<Popover.Header>
					<Popover.Title>图层尺寸</Popover.Title>
					<Popover.Description>设置图层的宽高。这是 Popover 的实时预览。</Popover.Description>
				</Popover.Header>
				<Field.Group class="gap-3">
					<Field.Field orientation="horizontal">
						<Field.Label for={`popover-preview-width-${pane}`} class="w-16">宽度</Field.Label>
						<Input id={`popover-preview-width-${pane}`} value="100%" class="h-8" />
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Field.Label for={`popover-preview-height-${pane}`} class="w-16">高度</Field.Label>
						<Input id={`popover-preview-height-${pane}`} value="25px" class="h-8" />
					</Field.Field>
				</Field.Group>
			</Popover.Content>
		</Popover.Root>
	</div>
{/snippet}

<ComponentTuner spec={POPOVER_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	/* The trigger sits on the edge opposite the chosen side so the panel has room. */
	.popover-canvas {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: 32px;
		overflow: hidden;
	}
	.popover-canvas[data-side="bottom"] {
		align-items: flex-start;
	}
	.popover-canvas[data-side="top"] {
		align-items: flex-end;
	}
	.popover-canvas[data-side="left"] {
		justify-content: flex-end;
	}
	.popover-canvas[data-side="right"] {
		justify-content: flex-start;
	}
</style>
