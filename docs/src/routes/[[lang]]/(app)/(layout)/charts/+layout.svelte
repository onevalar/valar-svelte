<script lang="ts">
	import ActiveTheme from "$lib/components/active-theme.svelte";
	import Announcement from "$lib/components/announcement.svelte";
	import ChartsNav from "$lib/components/charts-nav.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import PageActions from "$lib/components/page-header/page-actions.svelte";
	import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
	import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
	import PageHeader from "$lib/components/page-header/page-header.svelte";
	import PageNav from "$lib/components/page-nav.svelte";
	import ThemeSelector from "$lib/components/theme-selector.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { page } from "$app/state";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	let { children } = $props();
	const locale = $derived((page.data.locale ?? "en") as Locale);
	const title = $derived(t("charts.title"));
	const description = $derived(t("charts.description"));
</script>

<Metadata
	{title}
	{description}
	ogImage={{
		url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
	}}
/>

<ActiveTheme />
<PageHeader>
	<Announcement />
	<PageHeaderHeading>{title}</PageHeaderHeading>
	<PageHeaderDescription>{description}</PageHeaderDescription>
	<PageActions>
		<Button href="#charts" size="sm">{t("charts.browse")}</Button>
		<Button
			href={localizeHref("/docs/components/chart", locale)}
			variant="ghost"
			size="sm">{t("docs.documentation")}</Button
		>
	</PageActions>
</PageHeader>
<PageNav id="charts">
	<ChartsNav />
	<ThemeSelector class="me-4 hidden md:flex" />
</PageNav>
<div class="container-wrapper flex-1 section-soft">
	<div class="container pb-6">
		<section class="theme-container">{@render children?.()}</section>
	</div>
</div>
