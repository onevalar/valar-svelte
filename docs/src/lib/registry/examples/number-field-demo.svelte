<script lang="ts">
	import { NumberField } from "$lib/registry/ui/number-field/index.js";
	let quantity = $state<number | undefined>(3);
	let decimal = $state<number | undefined>(0.3);
</script>

<div class="grid w-full max-w-sm gap-6">
	<div class="grid gap-2">
		<label for="number-quantity" class="text-sm font-medium">数量 / Quantity</label>
		<NumberField id="number-quantity" bind:value={quantity} min={0} max={20} />
	</div>
	<div class="grid gap-2">
		<label for="number-decimal" class="text-sm font-medium">小数 / Decimal (−2 … 2)</label>
		<NumberField
			id="number-decimal"
			bind:value={decimal}
			min={-2}
			max={2}
			step={0.1}
			aria-describedby="number-hint"
		/>
		<p id="number-hint" class="text-xs text-muted-foreground">
			编辑时保留负号和小数点；失焦后按 0.1 步长规范化。
		</p>
	</div>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		当前值：{quantity ?? "空"} / {decimal ?? "空"}
	</p>
</div>
