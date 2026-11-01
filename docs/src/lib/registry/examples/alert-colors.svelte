<script lang="ts">
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
	import * as Alert from "$lib/registry/ui/alert/index.js";
</script>

<Alert.Root class="max-w-md border-chart-2/40 bg-chart-2/10 text-chart-2">
	<TriangleAlertIcon />
	<Alert.Title>Your subscription will expire in 3 days.</Alert.Title>
	<Alert.Description>
		Renew now to avoid service interruption or upgrade to a paid plan to continue using the service.
	</Alert.Description>
</Alert.Root>
