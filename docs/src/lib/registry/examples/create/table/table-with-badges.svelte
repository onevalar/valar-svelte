<script lang="ts">
	import * as Table from "$lib/registry/ui/table/index.js";
	import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="With Badges">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Task</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="text-right">Priority</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row>
				<Table.Cell class="font-medium">Design homepage</Table.Cell>
				<Table.Cell>
					<span
						class="inline-flex items-center rounded-full bg-chart-2/10 px-2 py-1 text-xs font-medium text-chart-2"
					>
						Completed
					</span>
				</Table.Cell>
				<Table.Cell class="text-right">
					<span
						class="inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
					>
						High
					</span>
				</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-medium">Implement API</Table.Cell>
				<Table.Cell>
					<span
						class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
					>
						In Progress
					</span>
				</Table.Cell>
				<Table.Cell class="text-right">
					<span
						class="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
					>
						Medium
					</span>
				</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-medium">Write tests</Table.Cell>
				<Table.Cell>
					<span
						class="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
					>
						Pending
					</span>
				</Table.Cell>
				<Table.Cell class="text-right">
					<span
						class="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
					>
						Low
					</span>
				</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
</Example>
