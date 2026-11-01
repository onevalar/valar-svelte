<script lang="ts">
	import { page } from "$app/state";
	import { siteConfig } from "$lib/config.js";
	import { localeFromPathname, translatePathname } from "$lib/i18n/config.js";

	let {
		title,
		ogImage,
		description,
		keywords = siteConfig.keywords,
		ogType = "website",
	}: {
		title?: string;
		ogImage?: Partial<(typeof siteConfig)["ogImage"]>;
		description?: string;
		keywords?: string[];
		ogType?: string;
	} = $props();

	const ogUrl = $derived.by(() => {
		if (!ogImage?.url) return page.url.origin + siteConfig.ogImage.url;
		if (ogImage.url.startsWith("/")) return page.url.origin + ogImage.url;
		return ogImage.url;
	});

	const ogWidth = $derived.by(() => {
		if (ogImage?.width) return ogImage.width;
		return siteConfig.ogImage.width;
	});

	const ogHeight = $derived.by(() => {
		if (ogImage?.height) return ogImage.height;
		return siteConfig.ogImage.height;
	});

	const locale = $derived(localeFromPathname(page.url.pathname));
	const englishUrl = $derived(
		page.url.origin + translatePathname(page.url.pathname, "en")
	);
	const chineseUrl = $derived(
		page.url.origin + translatePathname(page.url.pathname, "zh")
	);

	const trueTitle = $derived(
		!title || title === siteConfig.name ? siteConfig.name : `${title} - ${siteConfig.name}`
	);
</script>

<svelte:head>
	<title>{trueTitle}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords?.join(",")} />
	<meta name="author" content="Valar" />
	<meta name="creator" content="Valar" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={page.url.origin} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogUrl} />
	<meta name="twitter:image:alt" content={title} />
	<meta name="twitter:creator" content="Valar" />
	<meta property="og:title" content={title} />
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={page.url.origin + page.url.pathname} />
	<meta property="og:image" content={ogUrl} />
	<meta property="og:image:alt" content={title} />
	<meta property="og:image:width" content={ogWidth} />
	<meta property="og:image:height" content={ogHeight} />
	<meta property="og:description" content={description} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:locale" content={locale === "zh" ? "zh_CN" : "en_US"} />
	<meta property="og:locale:alternate" content={locale === "zh" ? "en_US" : "zh_CN"} />
	<link rel="alternate" hreflang="en" href={englishUrl} />
	<link rel="alternate" hreflang="zh-CN" href={chineseUrl} />
	<link rel="alternate" hreflang="x-default" href={englishUrl} />
</svelte:head>
