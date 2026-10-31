<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Stepper } from "$lib/registry/ui/stepper/index.js";
	let attempts = 0;
	const steps = [
		{ id: "prepare", title: "准备" },
		{ id: "verify", title: "异步校验" },
		{ id: "done", title: "完成" },
	];
	async function validate(from: string, _to: string, signal: AbortSignal) {
		if (from !== "verify") return true;
		await new Promise<void>((resolve, reject) => {
			const timer = setTimeout(() => {
				signal.removeEventListener("abort", abort);
				resolve();
			}, 1200);
			function abort() {
				clearTimeout(timer);
				reject(new DOMException("Aborted", "AbortError"));
			}
			signal.addEventListener("abort", abort, { once: true });
		});
		attempts++;
		return attempts > 1 || "首次校验失败，请重试；也可以返回上一步取消等待。";
	}
</script>

<Stepper {steps} beforeChange={validate} aria-label="异步失败与重试">
	{#snippet children({ step, index, pending, next, previous })}
		<div class="grid gap-4 rounded-md border p-4">
			<h3 class="font-medium">{step.title}</h3>
			<p role="status" class="text-sm text-muted-foreground">
				{pending
					? "正在校验，请稍候…"
					: index === 2
						? "校验成功"
						: "下一步会通过同一校验入口，重复点击不会启动第二个请求。"}
			</p>
			<div class="flex gap-2">
				<Button variant="outline" disabled={index === 0} onclick={previous}>上一步</Button><Button
					disabled={pending || index === 2}
					onclick={next}>{pending ? "校验中…" : "下一步 / 重试"}</Button
				>
			</div>
		</div>
	{/snippet}
</Stepper>
