<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Stepper } from "$lib/registry/ui/stepper/index.js";
	const steps = [
		{ id: "details", title: "填写信息", description: "Details" },
		{ id: "review", title: "核对内容", description: "Review" },
		{ id: "complete", title: "完成", description: "Complete" },
	];
</script>

<Stepper {steps} aria-label="基础流程">
	{#snippet children({ step, index, next, previous, pending })}
		<div class="grid gap-4 rounded-md border bg-card p-4 text-card-foreground">
			<h3 class="font-medium">{step.title}</h3>
			<p class="text-sm text-muted-foreground">
				使用上方步骤或下方按钮切换。方向键只移动焦点，Enter/Space 才激活。
			</p>
			<div class="flex gap-2">
				<Button variant="outline" disabled={index === 0} onclick={previous}>上一步</Button><Button
					disabled={index === steps.length - 1 || pending}
					onclick={next}>下一步</Button
				>
			</div>
		</div>
	{/snippet}
</Stepper>
