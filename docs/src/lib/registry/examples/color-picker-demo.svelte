<script lang="ts">
	import { ColorPicker } from "$lib/registry/ui/color-picker/index.js";

	let color = $state("#2563eb");
</script>

<div class="grid w-full max-w-xs gap-4">
	<ColorPicker
		label="主色"
		bind:value={color}
		presets={["#0f172a", "#2563eb", "#16a34a", "#d97706", "#dc2626", "#9333ea"]}
	/>
	<div class="h-10 rounded-md" style:background={color}></div>
</div>
