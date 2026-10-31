// !! BROWSER SAFE !!

export const SITE_BASE_URL = "http://127.0.0.1:5186";
export const OFFICIAL_REGISTRY_URL = `${SITE_BASE_URL}/registry`;
// The upstream Tailwind v3 registry that legacy projects keep in components.json. It is already
// style-scoped, so it is never rewritten; keeping it lets an existing legacy project keep working.
export const TW3_SITE_BASE_URL = "https://tw3.shadcn-svelte.com";

export const ALIASES = ["components", "ui", "hooks", "utils", "lib"] as const;

export const ALIAS_DEFAULTS = ALIASES.reduce(
	(acc, a) => {
		acc[a] = {
			placeholder: `$${a.toUpperCase()}$`,
			defaultPath: a === "utils" ? "$lib/utils" : `$lib/registry/${a}`,
		};
		return acc;
	},
	{} as Record<(typeof ALIASES)[number], { placeholder: string; defaultPath: string }>
);
