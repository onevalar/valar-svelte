<script lang="ts">
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="Custom Colors" class="max-w-fit">
	<div class="flex flex-wrap gap-2">
		<Badge class="bg-chart-2 text-primary-foreground dark:text-foreground">Chart 2</Badge>
		<Badge class="bg-chart-3 text-primary-foreground dark:text-foreground">Chart 3</Badge>
		<Badge class="bg-chart-4 text-primary-foreground dark:text-foreground">Chart 4</Badge>
		<Badge class="bg-chart-5 text-primary-foreground dark:text-foreground">Chart 5</Badge>
		<Badge class="bg-primary/10 text-primary">Primary</Badge>
		<Badge class="bg-chart-2/10 text-chart-2">Chart 2</Badge>
		<Badge class="bg-muted text-muted-foreground">Muted</Badge>
		<Badge class="bg-destructive/10 text-destructive">Destructive</Badge>
	</div>
</Example>
