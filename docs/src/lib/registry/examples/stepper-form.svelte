<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Stepper } from "$lib/registry/ui/stepper/index.js";
	let name = $state("");
	let email = $state("");
	let sent = $state(false);
	const steps = [
		{ id: "name", title: "个人信息" },
		{ id: "contact", title: "联系邮箱" },
		{ id: "confirm", title: "确认提交" },
	];
	function validate(from: string) {
		if (from === "name" && !name.trim()) return "请先填写姓名";
		if (from === "contact" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "请输入有效邮箱";
		return true;
	}
</script>

<Stepper {steps} beforeChange={validate} aria-label="多步表单">
	{#snippet children({ step, index, next, previous, pending })}
		<form
			class="grid gap-4 rounded-md border p-4"
			onsubmit={(event) => {
				event.preventDefault();
				if (index < 2) void next();
				else sent = true;
			}}
		>
			{#if step.id === "name"}<label for="stepper-name" class="text-sm font-medium">姓名</label
				><Input id="stepper-name" bind:value={name} required />
			{:else if step.id === "contact"}<label for="stepper-email" class="text-sm font-medium"
					>邮箱</label
				><Input id="stepper-email" type="email" bind:value={email} required />
			{:else}<p class="text-sm break-all">{name} · {email}</p>{/if}
			<div class="flex gap-2">
				<Button variant="outline" disabled={index === 0} onclick={previous}>上一步</Button><Button
					type="submit"
					disabled={pending || sent}>{index === 2 ? "提交" : "下一步"}</Button
				>
			</div>
			{#if sent && index === 2}<p role="status" class="text-sm">
					已在本地确认（未发送网络请求）
				</p>{/if}
		</form>
	{/snippet}
</Stepper>
