<script lang="ts">
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="Group with Count">
	<Avatar.Group>
		<Avatar.Root size="sm">
			<Avatar.Image src="/favicon.svg" alt="Valar" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size="sm">
			<Avatar.Image src="https://github.com/maxleiter.png" alt="@maxleiter" />
			<Avatar.Fallback>LR</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size="sm">
			<Avatar.Image src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
			<Avatar.Fallback>ER</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.GroupCount>+3</Avatar.GroupCount>
	</Avatar.Group>
	<Avatar.Group>
		<Avatar.Root>
			<Avatar.Image src="/favicon.svg" alt="Valar" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root>
			<Avatar.Image src="https://github.com/maxleiter.png" alt="@maxleiter" />
			<Avatar.Fallback>LR</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root>
			<Avatar.Image src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
			<Avatar.Fallback>ER</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.GroupCount>+3</Avatar.GroupCount>
	</Avatar.Group>
	<Avatar.Group>
		<Avatar.Root size="lg">
			<Avatar.Image src="/favicon.svg" alt="Valar" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size="lg">
			<Avatar.Image src="https://github.com/maxleiter.png" alt="@maxleiter" />
			<Avatar.Fallback>LR</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size="lg">
			<Avatar.Image src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
			<Avatar.Fallback>ER</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.GroupCount>+3</Avatar.GroupCount>
	</Avatar.Group>
</Example>
