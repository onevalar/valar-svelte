import type { CssSchema } from "./registry/schema.js";

export function createGlobalCssFile(): string {
	return `
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));
`;
}

export const shadcnSvelteTailwindCssImport: CssSchema = {
	'@import "@valar/svelte-cli/tailwind.css"': {},
};
