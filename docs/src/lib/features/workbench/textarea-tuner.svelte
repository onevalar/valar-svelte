<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TEXTAREA_SPEC } from "./textarea-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

{#snippet probe()}
	<Textarea value="probe" />
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="grid gap-6 p-4 md:p-6">
		<Field.Group class="max-w-md">
			<Field.Field>
				<Field.Label for={`textarea-preview-title-${pane}`}>标题</Field.Label>
				<Input id={`textarea-preview-title-${pane}`} value="周报" />
			</Field.Field>
			<Field.Field>
				<Field.Label for={`textarea-preview-body-${pane}`}>内容</Field.Label>
				<Textarea
					id={`textarea-preview-body-${pane}`}
					placeholder="写下本周进展…"
					value={"完成了表单组件的参数接入。\n下周计划：补充说明卡。"}
				/>
				<Field.Description>高度随内容增长；与上方 Input 对照圆角和留白。</Field.Description>
			</Field.Field>
		</Field.Group>
		<div class="grid max-w-2xl gap-3 sm:grid-cols-3">
			<Textarea aria-label="占位文字" placeholder="占位文字" />
			<Textarea aria-label="禁用" value="不可编辑" disabled />
			<Textarea aria-label="错误" value="内容过短" aria-invalid="true" />
		</div>
	</div>
{/snippet}

<ComponentTuner spec={TEXTAREA_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>
