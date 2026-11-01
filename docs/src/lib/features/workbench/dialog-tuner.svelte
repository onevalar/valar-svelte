<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { DIALOG_SPEC } from "./dialog-tuning.js";

	let { children }: { children: Snippet } = $props();
	// One flag per pane; closing and reopening replays the exit and enter animations.
	let open = $state({ current: true, before: true });

	async function replay(pane: "current" | "before") {
		open[pane] = false;
		// Let the exit animation play (slow tier is 300ms by default) before reopening.
		const content = document.querySelector<HTMLElement>(
			`[data-tuning-${pane}] [data-slot="dialog-content"]`
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
		A real Dialog rendered inline: no portal, no focus trap or scroll lock, ignores outside
		clicks, and lets Escape reach the editor. CSS below pins it inside this box.
	-->
	<div class="dialog-canvas" data-dialog-canvas>
		<Dialog.Root bind:open={open[pane]}>
			<Dialog.Content
				portalProps={{ disabled: true }}
				trapFocus={false}
				preventScroll={false}
				interactOutsideBehavior="ignore"
				escapeKeydownBehavior="defer-otherwise-ignore"
				onOpenAutoFocus={(event) => event.preventDefault()}
				onCloseAutoFocus={(event) => event.preventDefault()}
				showCloseButton={false}
			>
				<Dialog.Header>
					<Dialog.Title>编辑资料</Dialog.Title>
					<Dialog.Description>修改后点击保存。这是 Dialog 的实时预览。</Dialog.Description>
				</Dialog.Header>
				<Field.Group>
					<Field.Field>
						<Field.Label for={`dialog-preview-name-${pane}`}>姓名</Field.Label>
						<Input id={`dialog-preview-name-${pane}`} value="林夕" />
					</Field.Field>
				</Field.Group>
				<Dialog.Footer>
					<Button variant="outline">取消</Button>
					<Button>保存</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>
{/snippet}

<ComponentTuner spec={DIALOG_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.dialog-canvas {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 420px;
		padding: 32px 16px;
		overflow: hidden;
	}
	.dialog-canvas :global([data-slot="dialog-overlay"]) {
		position: absolute;
	}
	.dialog-canvas :global([data-slot="dialog-content"]) {
		position: relative;
		top: auto;
		left: auto;
		translate: none;
	}
</style>
