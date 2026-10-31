<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { NumberField } from "$lib/registry/ui/number-field/index.js";
	let result = $state("尚未提交");
</script>

<form
	class="grid w-full max-w-sm gap-4"
	onsubmit={(event) => {
		event.preventDefault();
		result = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
	}}
>
	<label for="number-amount" class="text-sm font-medium">金额 / Amount（必填）</label>
	<NumberField
		id="number-amount"
		name="amount"
		required
		min={0}
		max={10000}
		step={0.01}
		locale="de-DE"
		formatOptions={{ style: "currency", currency: "EUR" }}
		placeholder="可输入 1.234,56 €"
	/>
	<div class="flex gap-2">
		<Button type="submit">提交</Button><Button type="reset" variant="outline">重置</Button>
	</div>
	<output class="text-sm break-all text-muted-foreground">{result}</output>
</form>
