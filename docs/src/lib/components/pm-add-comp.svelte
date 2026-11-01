<script lang="ts">
	import { page } from "$app/state";
	import PMExecute from "./pm-execute.svelte";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	let { name }: { name: string } = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);
</script>

<PMExecute command={`@valar/svelte-cli add ${name} --cwd /absolute/path/to/your-app`} />

<p class="text-sm text-muted-foreground">
	{t("pm.localNote")}
	<a href={localizeHref("/docs/installation", locale)} class="underline">
		{t("pm.installationGuide")}
	</a>
</p>
