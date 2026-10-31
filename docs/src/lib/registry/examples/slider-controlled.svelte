<script lang="ts">
	import { Slider } from "$lib/registry/ui/slider/index.js";

	let value = $state([0.3, 0.7]);
</script>

<div class="mx-auto grid w-full max-w-xs gap-3">
	<div class="flex items-center justify-between gap-2">
		<span class="text-sm font-medium">Temperature</span>
		<span class="text-sm text-muted-foreground">{value.join(", ")}</span>
	</div>
	<Slider
		type="multiple"
		thumbLabels={["Minimum temperature", "Maximum temperature"]}
		bind:value
		min={0}
		max={1}
		step={0.1}
	/>
</div>
