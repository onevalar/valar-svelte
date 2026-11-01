<script lang="ts">
	import { page } from "$app/state";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	const locale = $derived((page.data.locale ?? "en") as Locale);
</script>

<a href={localizeHref("/docs", locale)} class="text-sm text-muted-foreground">
	Valar / Svelte · {t("home.badge")}
</a>
