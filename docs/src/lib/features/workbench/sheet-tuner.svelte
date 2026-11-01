<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Sheet from "$lib/registry/ui/sheet/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SHEET_SPEC } from "./sheet-tuning.js";

	let { children }: { children: Snippet } = $props();
	// One flag per pane; closing and reopening replays the exit and enter animations.
	let open = $state({ current: true, before: true });
	// Preview-only: which edge the panel slides from.
	let side = $state<"right" | "left" | "bottom" | "top">("right");
	const SIDES = [
		["right", "右侧"],
		["left", "左侧"],
		["bottom", "底部"],
		["top", "顶部"],
	] as const;

	async function replay(pane: "current" | "before") {
		open[pane] = false;
		const content = document.querySelector<HTMLElement>(
			`[data-tuning-${pane}] [data-slot="sheet-content"]`
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
			aria-label="滑出方向"
		>
			{#each SIDES as [value, label] (value)}
				<ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
		<Button size="sm" variant="outline" onclick={() => replay(pane)}>重播进入与退出</Button>
	</div>
	<!--
		A real Sheet rendered inline: no portal, focus trap or scroll lock, ignores outside
		clicks and lets Escape reach the editor. CSS below pins it inside this box.
	-->
	<div class="sheet-canvas">
		<Sheet.Root bind:open={open[pane]}>
			<Sheet.Content
				{side}
				portalProps={{ disabled: true }}
				trapFocus={false}
				preventScroll={false}
				interactOutsideBehavior="ignore"
				escapeKeydownBehavior="defer-otherwise-ignore"
				onOpenAutoFocus={(event) => event.preventDefault()}
				onCloseAutoFocus={(event) => event.preventDefault()}
			>
				<Sheet.Header>
					<Sheet.Title>编辑资料</Sheet.Title>
					<Sheet.Description>修改后点击保存。这是 Sheet 的实时预览。</Sheet.Description>
				</Sheet.Header>
				<Field.Group class="px-4">
					<Field.Field>
						<Field.Label for={`sheet-preview-name-${pane}`}>姓名</Field.Label>
						<Input id={`sheet-preview-name-${pane}`} value="林夕" />
					</Field.Field>
				</Field.Group>
				<Sheet.Footer>
					<Button>保存</Button>
					<Button variant="outline">取消</Button>
				</Sheet.Footer>
			</Sheet.Content>
		</Sheet.Root>
	</div>
{/snippet}

<ComponentTuner spec={SHEET_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.sheet-canvas {
		position: relative;
		min-height: 480px;
		overflow: hidden;
		/* Keep the overlay and panel inside the canvas card's rounded bottom corners. */
		border-bottom-left-radius: inherit;
		border-bottom-right-radius: inherit;
	}
	.sheet-canvas :global([data-slot="sheet-overlay"]),
	.sheet-canvas :global([data-slot="sheet-content"]) {
		position: absolute;
	}
</style>
