<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
</script>

<Card.Root class="relative mx-auto w-full max-w-sm pt-0">
	<img
		src="/favicon.svg"
		alt="Event cover"
		class="relative z-20 aspect-video w-full object-cover brightness-40 grayscale dark:brightness-25"
	/>
	<Card.Header>
		<Card.Action>
			<Badge variant="secondary">Featured</Badge>
		</Card.Action>
		<Card.Title>Design systems meetup</Card.Title>
		<Card.Description>
			A practical talk on component APIs, accessibility, and shipping faster.
		</Card.Description>
	</Card.Header>
	<Card.Footer>
		<Button class="w-full">View Event</Button>
	</Card.Footer>
</Card.Root>
