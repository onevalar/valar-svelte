<script lang="ts">
	import { page } from "$app/state";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const link = (href: string) => localizeHref(href, locale);
</script>

<footer class="border-t">
	<div
		class="container-wrapper flex flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground"
	>
		<span>Valar <span class="ml-1">/ Svelte</span></span>
		<nav class="flex gap-5">
			<a href={link("/docs")}>{t("footer.docs")}</a>
			<a href={link("/docs/about")}>{t("footer.license")}</a>
			<a href="https://github.com/onevalar/valar-svelte">GitHub</a>
		</nav>
	</div>
</footer>
