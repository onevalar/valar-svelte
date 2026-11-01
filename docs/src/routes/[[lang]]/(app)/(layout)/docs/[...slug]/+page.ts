import { getDoc } from "$lib/docs.js";
import { toLocale } from "$lib/i18n/config.js";
import type { HighlightedBlock } from "../../../../../api/block/[block]/+server.js";
import type { EntryGenerator, PageLoad } from "./$types.js";

export const prerender = true;

export const entries: EntryGenerator = () => {
	console.info("Prerendering /docs");
	const modules = import.meta.glob("/content/**/*.md");
	const entries: Array<{ lang?: string; slug: string }> = [];

	for (const path of Object.keys(modules)) {
		const relative = path.replace("/content/", "").replace(".md", "");
		const isChinese = relative === "zh" || relative.startsWith("zh/");
		const withoutLocale = isChinese ? relative.slice(3) : relative;
		const slug = withoutLocale === "index" ? "" : withoutLocale.replace(/\/index$/, "");

		// The changelog overview is rendered by its own route; `content/changelog.md` is legacy.
		if (slug === "changelog") continue;

		entries.push(isChinese ? { lang: "zh", slug } : { slug });
	}

	return entries;
};

/**
 * Any components / blocks that won't have a .json file associated with them.
 */
const ITEMS_TO_IGNORE = ["combobox", "data-table", "date-picker", "typography"];

export const load: PageLoad = async ({ params, fetch }) => {
	const locale = toLocale(params.lang);
	const doc = await getDoc(params.slug, locale);
	const name = doc.metadata.slug;
	if (params.slug.includes("components/") && !ITEMS_TO_IGNORE.includes(name)) {
		const res = await fetch(`/api/block/${name}`);
		const item: HighlightedBlock = await res.json();

		return { ...doc, locale, viewerData: item };
	}

	return { ...doc, locale, viewerData: null };
};
