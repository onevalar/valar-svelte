<script lang="ts">
	import GripVerticalIcon from "@tabler/icons-svelte/icons/grip-vertical";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { Attachment } from "svelte/attachments";

	let { attach }: { attach?: Attachment } = $props();
</script>

<Button
	aria-label="Drag to reorder"
	{@attach attach}
	variant="ghost"
	size="icon-xs"
	class="text-muted-foreground hover:bg-transparent"
>
	<GripVerticalIcon class="size-3 text-muted-foreground" />
</Button>
