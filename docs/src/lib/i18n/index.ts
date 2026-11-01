import { page } from "$app/state";
import { defaultLocale, toLocale, type Locale } from "./config.js";
import { en, zh, type MessageKey } from "./messages.js";

export * from "./config.js";
export type { MessageKey } from "./messages.js";

const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, zh };

export type MessageParams = Record<string, string | number>;

function interpolate(message: string, params?: MessageParams): string {
	if (!params) return message;

	let result = message;
	for (const [name, value] of Object.entries(params)) {
		result = result.replaceAll(`{${name}}`, String(value));
	}
	return result;
}

/** Translates a UI message for an explicit locale. Use outside components or for generated data. */
export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
	const dictionary = dictionaries[locale] ?? dictionaries[defaultLocale];
	return interpolate(dictionary[key] ?? en[key], params);
}

/** The active locale, derived from the `[[lang]]` route parameter. */
export function getLocale(): Locale {
	return toLocale((page.params as Record<string, string | undefined>).lang);
}

/** Reactive translation for components. Re-renders when the locale route changes. */
export function t(key: MessageKey, params?: MessageParams): string {
	return translate(getLocale(), key, params);
}

export function useLocale() {
	return {
		get current() {
			return getLocale();
		},
		get isChinese() {
			return getLocale() === "zh";
		},
	};
}
