<script lang="ts">
	import { page } from "$app/state";
	import { components } from "$content/index.js";
	import { PAGES_NEW } from "$lib/navigation.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	let { variant = "all" }: { variant?: "all" | "new" } = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);

	const list = $derived(
		components.filter(
			(component) =>
				component.locale === locale &&
				component.path !== "components" &&
				(variant === "all" || PAGES_NEW.includes(`/docs${component.slugFull}`))
		)
	);
</script>

{#if list.length}
	<div
		class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20"
	>
		{#each list as component (component.title)}
			<a
				href={localizeHref(`/docs${component.slugFull}`, locale)}
				class="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
			>
				{component.title}
				{#if variant === "all" && PAGES_NEW.includes("/docs" + component.slugFull)}
					<span class="sr-only">{t("nav.new")}</span>
					<span aria-hidden="true" class="flex size-2 rounded-full bg-svelte-orange"></span>
				{/if}
			</a>
		{/each}
	</div>
{/if}
