import { getChangelogPages } from "$lib/docs.js";
import { toLocale } from "$lib/i18n/config.js";
import type { PageLoad } from "./$types.js";

export const prerender = true;

const NUMBER_OF_LATEST_PAGES = 2;

export const load: PageLoad = async ({ params }) => {
	const locale = toLocale(params.lang);
	const pages = await getChangelogPages({
		includeComponentsForLatest: NUMBER_OF_LATEST_PAGES,
		locale,
	});

	return {
		locale,
		latestPages: pages.slice(0, NUMBER_OF_LATEST_PAGES),
		olderPages: pages.slice(NUMBER_OF_LATEST_PAGES),
	};
};
