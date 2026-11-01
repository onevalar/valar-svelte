import { toLocale } from "$lib/i18n/config.js";
import type { LayoutLoad } from "./$types.js";

export const load: LayoutLoad = ({ params }) => {
	return { locale: toLocale(params.lang) };
};
