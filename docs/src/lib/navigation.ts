import {
	aiElements,
	changelog as changelogDocs,
	components,
	darkMode,
	forms,
	installation,
	migration,
	registry,
	utils,
} from "$content/index.js";
import type { Component } from "svelte";
import { localeFromPathname, localizeHref, type Locale } from "$lib/i18n/config.js";
import { translate, type MessageKey } from "$lib/i18n/index.js";

export type NavItem = {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	label?: string;
	icon?: Component;
	/** Stable identifier used for grouping and filtering, independent of the locale. */
	key?: string;
};

export type SidebarNavItem = NavItem & {
	items: SidebarNavItem[];
};

export type NavItemWithChildren = NavItem & {
	items: NavItemWithChildren[];
};

export const PAGES_NEW: string[] = [];

export const PAGES_UPDATED: string[] = [];

const translationKeys = {
	getStarted: "nav.getStarted",
	components: "nav.components",
	aiElements: "nav.aiElements",
	forms: "nav.forms",
	changelog: "nav.changelog",
	installation: "nav.installation",
	theming: "nav.theming",
	darkMode: "nav.darkMode",
	cli: "nav.cli",
	javascript: "nav.javascript",
	utils: "nav.utils",
	registry: "nav.registry",
	migration: "nav.migration",
	sections: "nav.sections",
} as const satisfies Record<string, MessageKey>;

type Doc = (typeof components)[number];

function docsFor<T extends Doc>(docs: T[], locale: Locale): T[] {
	return docs.filter((doc) => doc.locale === locale);
}

function label(locale: Locale, key: MessageKey): string {
	return translate(locale, key);
}

function to(locale: Locale, path: string): string {
	return localizeHref(path, locale);
}

function compareTitles(locale: Locale) {
	const collator = new Intl.Collator(locale === "zh" ? "zh-CN" : "en");
	return (a: { title: string }, b: { title: string }) => collator.compare(a.title, b.title);
}

function generateSectionsNav(locale: Locale): SidebarNavItem[] {
	return [
		{ key: "get-started", title: label(locale, translationKeys.getStarted), href: to(locale, "/docs"), items: [] },
		{
			key: "components",
			title: label(locale, translationKeys.components),
			href: to(locale, "/docs/components"),
			items: [],
		},
		{
			key: "ai-elements",
			title: label(locale, translationKeys.aiElements),
			href: to(locale, "/docs/ai-elements"),
			items: [],
		},
		{ key: "forms", title: label(locale, translationKeys.forms), href: to(locale, "/docs/forms"), items: [] },
		{
			key: "changelog",
			title: label(locale, translationKeys.changelog),
			href: to(locale, "/docs/changelog"),
			items: [],
		},
	];
}

function generateGetStartedNav(locale: Locale): SidebarNavItem[] {
	return [
		{
			key: "installation",
			title: label(locale, translationKeys.installation),
			href: to(locale, "/docs/installation"),
			items: [],
		},
		{ title: "components.json", href: to(locale, "/docs/components-json"), items: [] },
		{ key: "theming", title: label(locale, translationKeys.theming), href: to(locale, "/docs/theming"), items: [] },
		{
			key: "dark-mode",
			title: label(locale, translationKeys.darkMode),
			href: to(locale, "/docs/dark-mode"),
			items: [],
		},
		{ key: "cli", title: label(locale, translationKeys.cli), href: to(locale, "/docs/cli"), items: [] },
		{
			key: "javascript",
			title: label(locale, translationKeys.javascript),
			href: to(locale, "/docs/javascript"),
			items: [],
		},
		{ title: locale === "zh" ? "方向 / RTL" : "Direction / RTL", href: to(locale, "/docs/direction"), items: [] },
		// The llms.txt endpoints are generated once for the whole site, not per locale.
		{ title: "llms.txt", href: "/llms.txt", items: [] },
	];
}

const INSTALL_ORDER = ["sveltekit", "vite", "astro", "manual"];

function generateInstallationNav(locale: Locale): SidebarNavItem[] {
	const docs = docsFor(installation, locale);
	const index = docs.find((doc) => doc.path === "installation");
	const items: SidebarNavItem[] = [];

	if (index) {
		items.push({ title: index.title, href: to(locale, "/docs/installation"), items: [] });
	}

	const rest = docs
		.filter((doc) => doc.path !== "installation")
		.sort((a, b) => INSTALL_ORDER.indexOf(a.slug) - INSTALL_ORDER.indexOf(b.slug));

	for (const doc of rest) {
		items.push({ title: doc.title, href: to(locale, `/docs/installation/${doc.slug}`), items: [] });
	}

	return items;
}

function generateComponentsNav(locale: Locale): SidebarNavItem[] {
	const docs = docsFor(components, locale);
	const index = docs.find((doc) => doc.path === "components");
	const items: SidebarNavItem[] = [];

	if (index) {
		items.push({ title: index.title, href: to(locale, "/docs/components"), items: [] });
	}

	const rest = docs.filter((doc) => doc.path !== "components").sort(compareTitles(locale));

	for (const doc of rest) {
		items.push({ title: doc.title, href: to(locale, `/docs/components/${doc.slug}`), items: [] });
	}

	return items;
}

const DARK_MODE_ORDER = ["svelte", "astro"];

function generateDarkModeNav(locale: Locale): SidebarNavItem[] {
	return docsFor(darkMode, locale)
		.filter((doc) => doc.path !== "dark-mode")
		.sort((a, b) => DARK_MODE_ORDER.indexOf(a.slug) - DARK_MODE_ORDER.indexOf(b.slug))
		.map((doc) => ({
			title: doc.title,
			href: to(locale, `/docs/dark-mode/${doc.slug}`),
			items: [],
		}));
}

function generateAiElementsNav(locale: Locale): SidebarNavItem[] {
	const docs = docsFor(aiElements, locale);
	const index = docs.find((doc) => doc.path === "ai-elements");
	const items: SidebarNavItem[] = [
		{
			title: index?.title ?? label(locale, translationKeys.aiElements),
			href: to(locale, "/docs/ai-elements"),
			items: [],
		},
	];

	const rest = docs.filter((doc) => doc.path !== "ai-elements").sort(compareTitles(locale));

	for (const doc of rest) {
		items.push({ title: doc.title, href: to(locale, `/docs/${doc.path}`), items: [] });
	}

	return items;
}

function generateUtilsNav(locale: Locale): SidebarNavItem[] {
	return docsFor(utils, locale)
		.sort(compareTitles(locale))
		.map((doc) => ({ title: doc.title, href: to(locale, `/docs/utils/${doc.slug}`), items: [] }));
}

const REGISTRY_ORDER = [
	"registry",
	"registry/getting-started",
	"registry/faq",
	"registry/examples",
	"registry/registry-json",
	"registry/registry-item-json",
];

function generateRegistryNav(locale: Locale): SidebarNavItem[] {
	const docs = docsFor(registry, locale);
	return REGISTRY_ORDER.flatMap((path) => {
		const doc = docs.find((item) => item.path === path);
		return doc ? [{ title: doc.title, href: to(locale, `/docs/${doc.path}`), items: [] }] : [];
	});
}

function generateFormsNav(locale: Locale): SidebarNavItem[] {
	return docsFor(forms, locale)
		.sort(compareTitles(locale))
		.map((doc) => ({
			title: doc.title,
			href: doc.path === "forms" ? to(locale, "/docs/forms") : to(locale, `/docs/forms/${doc.slug}`),
			items: [],
		}));
}

function generateMigrationNav(locale: Locale): SidebarNavItem[] {
	const docs = docsFor(migration, locale);
	const index = docs.find((doc) => doc.path === "migration");
	const items: SidebarNavItem[] = index
		? [{ title: index.title, href: to(locale, "/docs/migration"), items: [] }]
		: [];

	for (const doc of docs.filter((item) => item.path !== "migration")) {
		items.push({ title: doc.title, href: to(locale, `/docs/migration/${doc.slug}`), items: [] });
	}

	return items;
}

/** Sidebar navigation, generated per locale so titles and hrefs match the current language. */
export function getSidebarNavItems(locale: Locale = "en"): SidebarNavItem[] {
	return [
		{ key: "sections", title: label(locale, translationKeys.sections), items: generateSectionsNav(locale) },
		{
			key: "components",
			title: label(locale, translationKeys.components),
			items: generateComponentsNav(locale).filter((item) => item.href !== to(locale, "/docs/components")),
		},
		{ key: "ai-elements", title: label(locale, translationKeys.aiElements), items: generateAiElementsNav(locale) },
		{ key: "get-started", title: label(locale, translationKeys.getStarted), items: generateGetStartedNav(locale) },
		{ key: "utilities", title: label(locale, translationKeys.utils), items: generateUtilsNav(locale) },
		{
			key: "changelog",
			title: label(locale, translationKeys.changelog),
			href: to(locale, "/docs/changelog"),
			items: [],
		},
		{
			key: "installation",
			title: label(locale, translationKeys.installation),
			items: generateInstallationNav(locale).filter((item) => item.href !== to(locale, "/docs/installation")),
		},
		{ key: "dark-mode", title: label(locale, translationKeys.darkMode), items: generateDarkModeNav(locale) },
		{ key: "registry", title: label(locale, translationKeys.registry), items: generateRegistryNav(locale) },
		{ key: "forms", title: label(locale, translationKeys.forms), items: generateFormsNav(locale) },
		{
			key: "migration",
			title: label(locale, translationKeys.migration),
			items: generateMigrationNav(locale).filter((item) => item.href !== to(locale, "/docs/migration")),
		},
	];
}

export function getMainNavItems(locale: Locale = "en"): NavItem[] {
	return [
		{ title: label(locale, "nav.components"), href: to(locale, "/docs/components") },
		{ title: locale === "zh" ? "设计 token" : "Design tokens", href: to(locale, "/themes") },
		{ title: label(locale, "nav.docs"), href: to(locale, "/docs/installation") },
	];
}

export function getFullNavItems(locale: Locale = "en"): Array<SidebarNavItem & { index: number }> {
	return [
		...generateComponentsNav(locale),
		...generateAiElementsNav(locale),
		...generateGetStartedNav(locale),
		...generateUtilsNav(locale),
		...generateInstallationNav(locale).filter((item) => item.href !== to(locale, "/docs/installation")),
		...generateDarkModeNav(locale),
		...generateRegistryNav(locale),
		...generateFormsNav(locale),
		...generateMigrationNav(locale),
	].map((item, index) => ({
		...item,
		index,
	}));
}

export function findNeighbors(pathName: string): {
	previous: SidebarNavItem | null;
	next: SidebarNavItem | null;
} {
	const path = pathName.split("?")[0].split("#")[0];
	const locale = localeFromPathname(path);
	const fullNavItems = getFullNavItems(locale);
	const normalized = path.length > 1 ? path.replace(/\/$/, "") : path;
	const index = fullNavItems.findIndex((item) => item.href === normalized);

	if (index === -1) {
		return { previous: null, next: null };
	}

	let previous: SidebarNavItem | null = null;
	for (let i = index - 1; i >= 0; i--) {
		if (fullNavItems[i].href !== "/llms.txt") {
			previous = fullNavItems[i];
			break;
		}
	}

	let next: SidebarNavItem | null = null;
	for (let i = index + 1; i < fullNavItems.length; i++) {
		if (fullNavItems[i].href !== "/llms.txt") {
			next = fullNavItems[i];
			break;
		}
	}

	return { previous, next };
}

/** Changelog entries are exposed through the same navigation model for the docs sidebar. */
export function getChangelogNav(locale: Locale = "en"): SidebarNavItem[] {
	return docsFor(changelogDocs, locale).map((doc) => ({
		title: doc.title,
		href: to(locale, `/docs/${doc.path}`),
		items: [],
	}));
}
