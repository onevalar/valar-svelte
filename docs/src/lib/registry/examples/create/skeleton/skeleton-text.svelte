<script lang="ts">
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="Text">
	<div class="flex w-full flex-col gap-2">
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-3/4" />
	</div>
</Example>
