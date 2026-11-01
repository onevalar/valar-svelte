<script lang="ts">
	import { page } from "$app/state";
	import { localeTags, type Locale } from "$lib/i18n/config.js";

	let { children } = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);

	$effect(() => {
		document.documentElement.lang = localeTags[locale];
	});
</script>

{@render children()}
