<script lang="ts">
	import Announcement from "$lib/components/announcement.svelte";
	import BlocksNav from "$lib/components/blocks-nav.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import PageActions from "$lib/components/page-header/page-actions.svelte";
	import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
	import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
	import PageHeader from "$lib/components/page-header/page-header.svelte";
	import PageNav from "$lib/components/page-nav.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { page } from "$app/state";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	let { children } = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const title = $derived(t("blocks.title"));
	const description = $derived(t("blocks.description"));
</script>

<Metadata
	{title}
	{description}
	ogImage={{
		url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
	}}
/>

<PageHeader>
	<Announcement />
	<PageHeaderHeading>{title}</PageHeaderHeading>
	<PageHeaderDescription>{description}</PageHeaderDescription>
	<PageActions>
		<Button href="#blocks" size="sm">{t("blocks.browse")}</Button>
		<!-- <Button href="/docs/blocks" variant="ghost" size="sm">Add a block</Button> -->
	</PageActions>
</PageHeader>
<PageNav>
	<BlocksNav />
	<Button
		size="sm"
		variant="secondary"
		href={localizeHref("/blocks/sidebar", locale)}
		class="me-7 hidden shadow-none lg:flex"
	>
		{t("blocks.browseAll")}
	</Button>
</PageNav>
<div class="container-wrapper flex-1 section-soft md:py-12">
	<div class="container">{@render children?.()}</div>
</div>
