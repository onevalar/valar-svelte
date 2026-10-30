<script lang="ts">
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";

	const usernames = ["Designer", "Developer", "Reviewer"] as const;
</script>

<Card.Root class="max-w-sm">
	<Card.Header>
		<Card.Title>
			Team preview <Badge variant="secondary">Demo</Badge>
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-wrap gap-2">
			{#each usernames as username (username)}
				<Avatar.Root>
					<Avatar.Image src="/favicon.svg" alt={username} />
					<Avatar.Fallback>{username.charAt(0)}</Avatar.Fallback>
				</Avatar.Root>
			{/each}
		</div>
	</Card.Content>
	<Card.Footer>
		<a
			href="https://github.com/onevalar/valar-svelte/graphs/contributors"
			class="text-sm underline underline-offset-4"
		>
			View repository
		</a>
	</Card.Footer>
</Card.Root>
