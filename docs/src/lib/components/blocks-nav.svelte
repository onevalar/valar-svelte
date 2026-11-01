<script lang="ts">
	import { page } from "$app/state";
	import { registryCategories } from "$lib/registry/registry-categories.js";
	import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t, type MessageKey } from "$lib/i18n/index.js";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const link = (path: string) => localizeHref(path, locale);

	const categoryLabels: Record<string, MessageKey> = {
		sidebar: "blocks.category.sidebar",
		login: "blocks.category.login",
		"sign-up": "blocks.category.sign-up",
		otp: "blocks.category.otp",
		calendar: "blocks.category.calendar",
	};

	const categoryLabel = (slug: string, fallback: string) => {
		const key = categoryLabels[slug];
		return key ? t(key) : fallback;
	};
</script>

{#snippet BlocksNavLink({
	category,
	isActive,
}: {
	category: (typeof registryCategories)[number];
	isActive: boolean;
})}
	{#if !category.hidden}
		<a
			href={link(`/blocks/${category.slug}`)}
			class="flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"
			data-active={isActive}
		>
			{categoryLabel(category.slug, category.name)}
		</a>
	{/if}
{/snippet}

<div class="relative overflow-hidden">
	<ScrollArea class="max-w-none" orientation="both" scrollbarXClasses="invisible">
		<div class="flex items-center">
			{@render BlocksNavLink({
				category: { name: t("blocks.featured"), slug: "", hidden: false },
				isActive: page.url.pathname === link("/blocks"),
			})}
			{#each registryCategories as category (category.slug)}
				{@render BlocksNavLink({
					category,
					isActive: page.url.pathname === link(`/blocks/${category.slug}`),
				})}
			{/each}
		</div>
	</ScrollArea>
</div>
