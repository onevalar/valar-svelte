import type { Handle } from "@sveltejs/kit";
import { localeFromPathname, localeTags } from "$lib/i18n/config.js";

/**
 * Prerendered HTML is generated per locale, so the `<html lang>` attribute is rewritten here
 * instead of relying on a client-side effect (which would be too late for crawlers and readers).
 */
export const handle: Handle = async ({ event, resolve }) => {
	const tag = localeTags[localeFromPathname(event.url.pathname)];

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('<html lang="en"', `<html lang="${tag}"`),
	});
};
