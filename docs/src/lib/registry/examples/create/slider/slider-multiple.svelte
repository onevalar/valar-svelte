<script lang="ts">
	import { Slider } from "$lib/registry/ui/slider/index.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="Multiple Thumbs">
	<Slider type="multiple" value={[10, 20, 70]} max={100} step={10} />
</Example>
