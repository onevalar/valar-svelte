<script lang="ts">
	import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";
</script>

<div class="w-full max-w-sm">
	<AspectRatio ratio={16 / 9} class="rounded-lg bg-muted">
		<img
			src="/favicon.svg"
			alt="Placeholder"
			class="size-full rounded-lg object-cover grayscale dark:brightness-20"
		/>
	</AspectRatio>
</div>
