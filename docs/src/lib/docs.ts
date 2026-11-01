import {
	components,
	darkMode,
	gettingStarted,
	installation,
	migration,
	registry,
	forms,
	utils,
	aiElements,
	changelog,
} from "$content/index.js";
import { error } from "@sveltejs/kit";
import type { Component } from "svelte";
import { localizeHref, type Locale } from "$lib/i18n/config.js";

const allDocs = [
	...gettingStarted,
	...migration,
	...components,
	...installation,
	...darkMode,
	...registry,
	...forms,
	...utils,
	...aiElements,
	...changelog,
];

type DocMetadata = (typeof allDocs)[number];
type DocResolver = () => Promise<{ default: Component; metadata: DocMetadata }>;
type ChangelogMetadata = (typeof changelog)[number];
type ChangelogResolver = () => Promise<{ default: Component }>;
type ChangelogPageEntry = ChangelogPage & { resolver: ChangelogResolver };

const changelogModules = import.meta.glob(["/content/changelog/**/*.md", "/content/zh/changelog/**/*.md"]);

export type ChangelogPage = {
	href: string;
	slug: string;
	metadata: ChangelogMetadata;
	component: Component | null;
	date: Date | null;
};

/** Splits a markdown module path into its locale and locale-less document path. */
function moduleDocKey(modulePath: string): { locale: Locale; path: string } {
	const relative = modulePath.replace("/content/", "").replace(".md", "").trim();
	const isChinese = relative === "zh" || relative.startsWith("zh/");
	const withoutLocale = isChinese ? relative.slice(3) : relative;

	return {
		locale: isChinese ? "zh" : "en",
		path: withoutLocale.replace(/\/index$/, "") || "index",
	};
}

function getDocMetadata(slug: string, locale: Locale = "en"): DocMetadata | undefined {
	return allDocs.find((doc) => doc.path === slug && doc.locale === locale);
}

function getChangelogDate(page: ChangelogMetadata): Date | null {
	if (page.date) {
		const date = new Date(page.date);
		if (!Number.isNaN(date.getTime())) {
			return date;
		}
	}

	const match = (page.slug || page.path).match(/(\d{4})-(\d{2})/);
	if (match) {
		return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
	}

	return null;
}

export async function getDoc(
	_slug: string,
	locale: Locale = "en"
): Promise<{ component: Component; metadata: DocMetadata }> {
	const modules = import.meta.glob("/content/**/*.md");
	const slug = _slug === "" ? "index" : _slug;

	let match: { path?: string; resolver?: DocResolver } = {};

	for (const [path, resolver] of Object.entries(modules)) {
		const key = moduleDocKey(path);
		if (key.locale === locale && key.path === slug) {
			match = { path, resolver: resolver as unknown as DocResolver };
			break;
		}
	}

	const doc = await match?.resolver?.();
	const metadata = getDocMetadata(slug, locale);

	if (!doc || !metadata) {
		error(404, "Could not find the documentation page.");
	}

	return {
		component: doc.default,
		metadata,
	};
}

type ChangelogPagesOptions = {
	includeComponentsForLatest?: number;
	locale?: Locale;
};

export async function getChangelogPages(
	options: ChangelogPagesOptions = {}
): Promise<ChangelogPage[]> {
	const locale = options.locale ?? "en";
	const changelogByPath = new Map(
		changelog.filter((doc) => doc.locale === locale).map((doc) => [doc.path, doc])
	);
	const pages: ChangelogPageEntry[] = [];

	for (const [modulePath, resolver] of Object.entries(changelogModules)) {
		const key = moduleDocKey(modulePath);
		if (key.locale !== locale) continue;

		const path = key.path;
		const metadata = changelogByPath.get(path);

		if (!metadata || metadata.path === "changelog") {
			continue;
		}

		pages.push({
			href: localizeHref(`/docs/${metadata.path}`, locale),
			slug: metadata.slug ?? metadata.path,
			metadata,
			component: null,
			date: getChangelogDate(metadata),
			resolver: resolver as ChangelogResolver,
		});
	}

	pages.sort((a, b) => {
		const dateA = a.date?.getTime() ?? 0;
		const dateB = b.date?.getTime() ?? 0;
		return dateB - dateA;
	});

	const componentCount = options.includeComponentsForLatest ?? pages.length;

	await Promise.all(
		pages.slice(0, componentCount).map(async (page) => {
			const module = await page.resolver();
			page.component = module.default;
		})
	);

	return pages.map(({ resolver: _resolver, ...page }) => page);
}
