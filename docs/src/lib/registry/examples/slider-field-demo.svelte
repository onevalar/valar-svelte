<script lang="ts">
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";

	let height = $state(32);
	let opacity = $state(0.6);
</script>

<div class="grid w-full max-w-sm gap-6">
	<SliderField label="高度" bind:value={height} min={16} max={96} unit="px" />
	<SliderField label="透明度" bind:value={opacity} min={0} max={1} step={0.05} />
	<p class="text-sm text-muted-foreground" aria-live="polite">当前值：{height}px / {opacity}</p>
</div>
