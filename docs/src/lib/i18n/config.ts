/**
 * Locale configuration for the Valar Svelte site.
 *
 * English lives at the site root and Chinese is served from the `/zh` prefix, which keeps
 * every existing English URL stable while giving the Chinese pages their own indexable URLs.
 */

export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE_NAME = "valar_svelte_locale";

/** BCP 47 tags used for `<html lang>` and `hreflang`. */
export const localeTags: Record<Locale, string> = {
	en: "en",
	zh: "zh-CN",
};

/** Short labels shown inside the language switcher. */
export const localeLabels: Record<Locale, string> = {
	en: "EN",
	zh: "中文",
};

export const localeNames: Record<Locale, string> = {
	en: "English",
	zh: "中文",
};

/** The URL prefix for a locale. English is served without a prefix. */
export function localePrefix(locale: Locale): string {
	return locale === "zh" ? "/zh" : "";
}

export function isLocale(value: string | null | undefined): value is Locale {
	return value === "en" || value === "zh";
}

/** Normalizes an arbitrary value (route param, cookie…) to a supported locale. */
export function toLocale(value: string | null | undefined): Locale {
	return value === "zh" ? "zh" : defaultLocale;
}

/**
 * Prefixes an internal href with the locale segment.
 *
 * External links, protocol-relative links, hashes and already-prefixed links are returned
 * untouched so the helper can be applied in shared navigation code.
 */
export function localizeHref(href: string, locale: Locale): string {
	if (!href || locale === "en") return href;
	if (!href.startsWith("/") || href.startsWith("//")) return href;

	if (href === "/zh" || href.startsWith("/zh/") || href.startsWith("/zh#") || href.startsWith("/zh?")) {
		return href;
	}

	return href === "/" ? "/zh" : `/zh${href}`;
}

/** Removes the locale prefix from a pathname. */
export function stripLocale(pathname: string): string {
	if (pathname === "/zh") return "/";
	if (pathname.startsWith("/zh/")) return pathname.slice(3);
	return pathname;
}

/** Reads the locale encoded in a pathname. */
export function localeFromPathname(pathname: string): Locale {
	return pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : defaultLocale;
}

/** Builds the equivalent pathname in another locale. */
export function translatePathname(pathname: string, locale: Locale): string {
	const path = stripLocale(pathname);
	return localizeHref(path === "/" ? "/" : path, locale);
}

/**
 * Builds the equivalent URL in another locale, preserving the path, query string and hash.
 *
 * SvelteKit throws when `url.search` or `url.hash` is read while prerendering, so those reads
 * are guarded — prerendered pages never carry a query string or fragment anyway.
 */
export function translateUrl(url: URL, locale: Locale): string {
	const localized = translatePathname(url.pathname, locale);

	let suffix = "";
	try {
		suffix = `${url.search}${url.hash}`;
	} catch {
		suffix = "";
	}

	return `${localized}${suffix}`;
}
