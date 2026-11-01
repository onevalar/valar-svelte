<script lang="ts">
	import Announcement from "$lib/components/announcement.svelte";
	import ColorsNav from "$lib/components/colors-nav.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import PageActions from "$lib/components/page-header/page-actions.svelte";
	import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
	import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
	import PageHeader from "$lib/components/page-header/page-header.svelte";
	import Button from "$lib/registry/ui/button/button.svelte";
	import { page } from "$app/state";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const title = $derived(t("colors.title"));
	const description = $derived(t("colors.description"));

	let { children } = $props();
</script>

<Metadata
	{title}
	{description}
	ogImage={{
		url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
	}}
/>

<div>
	<PageHeader>
		<Announcement />
		<PageHeaderHeading>{title}</PageHeaderHeading>
		<PageHeaderDescription>{description}</PageHeaderDescription>
		<PageActions>
			<Button href="#colors" size="sm">{t("colors.browse")}</Button>
			<Button
				href={localizeHref("/docs/theming", locale)}
				variant="ghost"
				size="sm">{t("docs.documentation")}</Button
			>
		</PageActions>
	</PageHeader>
	<div class="hidden">
		<div class="container-wrapper">
			<div class="container flex items-center justify-between gap-8 py-4">
				<ColorsNav class="flex-1 overflow-hidden [&>a:first-child]:text-primary" />
			</div>
		</div>
	</div>
	<div class="container-wrapper">
		<div class="container py-6">
			<section id="colors" class="scroll-mt-20">
				{@render children?.()}
			</section>
		</div>
	</div>
</div>
