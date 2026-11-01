<script lang="ts">
	import ActiveTheme from "$lib/components/active-theme.svelte";
	import Announcement from "$lib/components/announcement.svelte";
	import ExamplesNav from "$lib/components/examples-nav.svelte";
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
	const title = $derived(t("examples.title"));
	const description = $derived(t("examples.description"));
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
	<PageHeaderHeading>{t("examples.heading")}</PageHeaderHeading>
	<PageHeaderDescription>{t("examples.lead")}</PageHeaderDescription>
	<PageActions>
		<Button href={localizeHref("/docs", locale)} size="sm">{t("home.getStarted")}</Button>
		<Button href={localizeHref("/blocks", locale)} size="sm" variant="ghost">
			{t("blocks.browse")}
		</Button>
	</PageActions>
</PageHeader>
<PageNav id="examples">
	<ExamplesNav class="flex-1 overflow-hidden [&>a:first-child]:text-primary" />
	<ThemeSelector class="me-4 hidden md:block" />
</PageNav>
<div class="container-wrapper flex flex-1 flex-col section-soft pb-6">
	<div class="container flex flex-1 scroll-mt-20 flex-col theme-container">
		<div
			class="flex flex-col overflow-hidden rounded-lg border bg-background bg-clip-padding md:flex-1 xl:rounded-xl"
		>
			{@render children()}
		</div>
	</div>
</div>
