<script lang="ts">
	import { Questionnaire as QuestionnairePrimitive } from "@valar/svelte-primitives/questionnaire";
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		item = $bindable(undefined),
		ref = $bindable(null),
		messages,
		...restProps
	}: QuestionnairePrimitive.RootProps = $props();

	// Valar: Chinese defaults for the texts the primitive generates; `messages` still overrides each one.
	const merged = $derived({
		progressLabel: "问卷进度",
		progress: (current: number, total: number) => `第 ${current} 题，共 ${total} 题`,
		requiredError: "请选择一个答案后继续。",
		optionalError: "请选择一个答案或跳过此题。",
		...messages,
	});
</script>

<QuestionnairePrimitive.Root
	bind:item
	bind:ref
	data-slot="questionnaire"
	messages={merged}
	class={cn("cn-questionnaire flex w-full min-w-0 flex-col", className)}
	{...restProps}
/>
