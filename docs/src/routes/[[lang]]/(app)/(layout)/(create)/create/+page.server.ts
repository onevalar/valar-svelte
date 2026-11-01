import { redirect } from "@sveltejs/kit";

export function load({ url, params }) {
	const prefix = params.lang === "zh" ? "/zh" : "";
	redirect(303, `${prefix}/create/preview-02${url.search}`);
}
