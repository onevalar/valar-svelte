<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_SIZES } from "./button-tuning.js";
	import { INPUT_SPEC } from "./input-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

{#snippet probe()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-button={size.id}>{size.label}</Button>
	{/each}
	<Input value="probe" />
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="grid gap-6 p-4 md:p-6">
		<Field.Field class="max-w-sm">
			<Field.Label for={`input-preview-email-${pane}`}>邮箱</Field.Label>
			<Input id={`input-preview-email-${pane}`} type="email" placeholder="name@example.com" />
			<Field.Description>用于接收通知，不会公开。</Field.Description>
		</Field.Field>
		<div class="grid max-w-2xl gap-3 sm:grid-cols-2">
			<Input aria-label="占位文字" placeholder="占位文字" />
			<Input aria-label="已填写" value="林夕" />
			<Input aria-label="禁用" value="不可编辑" disabled />
			<Input aria-label="错误" value="格式不正确" aria-invalid="true" />
		</div>
		<div class="grid gap-2">
			<span class="text-xs text-muted-foreground">与 Button 默认尺寸并排</span>
			<div class="flex max-w-sm items-center gap-2" data-input-row>
				<Input aria-label="搜索" placeholder="搜索组件" />
				<Button>搜索</Button>
			</div>
		</div>
	</div>
{/snippet}

<ComponentTuner spec={INPUT_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>
