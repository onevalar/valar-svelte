import { z } from "zod";

/**
 * Global token write-back into `src/lib/registry/styles/valar/tokens.json`.
 * The file holds only values that differ from the upstream base theme. `themes.ts` merges it
 * into `BASE_THEMES` at build time, so `registry/colors/<base>.json` (what `init` installs) and
 * the docs previews pick it up. Only the `/themes` page writes this file; component pages are
 * read-only for global tokens.
 *
 * Keep this module free of `themes.ts` imports: the Vite config imports it, and anything it
 * imports becomes a config dependency that restarts the dev server when it changes.
 */
export const TOKEN_OVERRIDE_PATH = "src/lib/registry/styles/valar/tokens.json";

export const BASE_THEME_NAMES = [
	"neutral",
	"stone",
	"zinc",
	"mauve",
	"olive",
	"mist",
	"taupe",
] as const;

export const COLOR_TOKENS = [
	"background",
	"foreground",
	"card",
	"card-foreground",
	"popover",
	"popover-foreground",
	"primary",
	"primary-foreground",
	"secondary",
	"secondary-foreground",
	"muted",
	"muted-foreground",
	"accent",
	"accent-foreground",
	"destructive",
	"border",
	"input",
	"ring",
	"chart-1",
	"chart-2",
	"chart-3",
	"chart-4",
	"chart-5",
	"sidebar",
	"sidebar-foreground",
	"sidebar-primary",
	"sidebar-primary-foreground",
	"sidebar-accent",
	"sidebar-accent-foreground",
	"sidebar-border",
	"sidebar-ring",
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

/** Tailwind's default type scale. Overrides land in `@theme inline` as `--text-*`. */
export const TYPE_SCALE_DEFAULTS = {
	"text-xs": "0.75rem",
	"text-sm": "0.875rem",
	"text-base": "1rem",
	"text-lg": "1.125rem",
	"text-xl": "1.25rem",
} as const;
export type TypeToken = keyof typeof TYPE_SCALE_DEFAULTS;
export const TYPE_TOKENS = Object.keys(TYPE_SCALE_DEFAULTS) as TypeToken[];

/**
 * Motion and border-width tokens (mode-independent, stored with `radius` in `light`). They are
 * Valar additions, not upstream theme values: `themes.ts` adds these defaults to every base
 * theme, and `@valar/svelte-cli/tailwind.css` maps them to `duration-*`, `ease-*` and `border`.
 * Defaults equal the literals the upstream styles used, so nothing changes until edited.
 */
export const MOTION_DURATION_DEFAULTS = {
	"motion-duration-fast": "100ms",
	"motion-duration-normal": "200ms",
	"motion-duration-slow": "300ms",
	"motion-duration-interaction": "150ms",
} as const;
export const MOTION_EASE_DEFAULTS = {
	"motion-ease-enter": "cubic-bezier(0.22, 1, 0.36, 1)",
	"motion-ease-exit": "cubic-bezier(0.7, 0, 0.84, 0)",
	"motion-ease-standard": "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;
export const VALAR_TOKEN_DEFAULTS = {
	...MOTION_DURATION_DEFAULTS,
	...MOTION_EASE_DEFAULTS,
	"border-width": "1px",
} as const;
export type DurationToken = keyof typeof MOTION_DURATION_DEFAULTS;
export type EaseToken = keyof typeof MOTION_EASE_DEFAULTS;
export const DURATION_TOKENS = Object.keys(MOTION_DURATION_DEFAULTS) as DurationToken[];
export const EASE_TOKENS = Object.keys(MOTION_EASE_DEFAULTS) as EaseToken[];

const ms = z
	.string()
	.regex(/^\d+ms$/, "只接受整数毫秒，如 200ms")
	.refine((value) => Number.parseInt(value) <= 2000, "最长 2000ms");
const NUMBER = String.raw`-?\d*\.?\d+`;
const ease = z
	.string()
	.max(80)
	.regex(
		new RegExp(
			String.raw`^(?:linear|cubic-bezier\(\s*${NUMBER}\s*,\s*${NUMBER}\s*,\s*${NUMBER}\s*,\s*${NUMBER}\s*\))$`
		),
		"只接受 linear 或 cubic-bezier(x1, y1, x2, y2)"
	);
const px = z
	.string()
	.regex(/^\d+(?:\.5)?px$/)
	.refine((value) => Number.parseFloat(value) <= 4, "范围 0–4px");

const OKLCH = /^oklch\(\s*\d*\.?\d+%?\s+\d*\.?\d+\s+\d*\.?\d+(?:\s*\/\s*\d*\.?\d+%?)?\s*\)$/;
const rem = (min: number, max: number) =>
	z
		.string()
		.regex(/^\d*\.?\d+rem$/)
		.refine((value) => {
			const n = Number.parseFloat(value);
			return n >= min && n <= max;
		}, `范围 ${min}–${max}rem`);
const color = z.string().max(60).regex(OKLCH, "只接受 oklch() 颜色");

const colorShape = Object.fromEntries(
	COLOR_TOKENS.map((token) => [token, color.optional()])
) as Record<ColorToken, z.ZodOptional<typeof color>>;
export const tokenOverrideSchema = z
	.object({
		light: z
			.object({
				...colorShape,
				radius: rem(0, 2).optional(),
				...Object.fromEntries(DURATION_TOKENS.map((token) => [token, ms.optional()])),
				...Object.fromEntries(EASE_TOKENS.map((token) => [token, ease.optional()])),
				"border-width": px.optional(),
			})
			.strict()
			.optional(),
		dark: z.object(colorShape).strict().optional(),
		theme: z
			.object(
				Object.fromEntries(TYPE_TOKENS.map((token) => [token, rem(0.5, 3).optional()])) as Record<
					TypeToken,
					z.ZodOptional<ReturnType<typeof rem>>
				>
			)
			.strict()
			.optional(),
	})
	.strict();
export type TokenOverride = z.infer<typeof tokenOverrideSchema>;

export const tokenOverrideFileSchema = z.partialRecord(
	z.enum(BASE_THEME_NAMES),
	tokenOverrideSchema
);
export type TokenOverrideFile = z.infer<typeof tokenOverrideFileSchema>;

/** The `/themes` page sends the complete override set for one base theme; it replaces the old one. */
export const tokenOverridePayloadSchema = z
	.object({ base: z.enum(BASE_THEME_NAMES), override: tokenOverrideSchema })
	.strict();

/** Drops empty sections so the file only lists real changes, then writes keys in a stable order. */
export function serializeTokenOverrides(file: TokenOverrideFile): string {
	const out: Record<string, Record<string, Record<string, string>>> = {};
	for (const base of BASE_THEME_NAMES) {
		const entry = file[base];
		if (!entry) continue;
		const sections: Record<string, Record<string, string>> = {};
		for (const section of ["light", "dark", "theme"] as const) {
			const values = entry[section] as Record<string, string> | undefined;
			if (values && Object.keys(values).length) {
				sections[section] = Object.fromEntries(
					Object.entries(values).sort(([a], [b]) => a.localeCompare(b))
				);
			}
		}
		if (Object.keys(sections).length) out[base] = sections;
	}
	return JSON.stringify(out, null, "\t") + "\n";
}

type CssVars = {
	light?: Record<string, string>;
	dark?: Record<string, string>;
	theme?: Record<string, string>;
};

/** Returns `base` with the override applied on top. Unknown bases are returned unchanged. */
export function applyTokenOverride<T extends { cssVars?: CssVars }>(
	theme: T,
	override: TokenOverride | undefined
): T {
	if (!override) return theme;
	const cssVars = theme.cssVars ?? {};
	return {
		...theme,
		cssVars: {
			...cssVars,
			light: { ...cssVars.light, ...override.light },
			dark: { ...cssVars.dark, ...override.dark },
			...(override.theme && Object.keys(override.theme).length
				? { theme: { ...cssVars.theme, ...override.theme } }
				: {}),
		},
	};
}

/** Lists every token whose value differs, for the confirmation dialog. */
export function diffTokens(
	before: Record<string, string>,
	after: Record<string, string>
): { token: string; from: string; to: string }[] {
	return Object.keys(after)
		.filter((token) => after[token] !== before[token])
		.map((token) => ({ token, from: before[token] ?? "", to: after[token]! }));
}

// --- OKLCH ⇄ hex -----------------------------------------------------------------------------
// Tokens are stored in OKLCH; the color picker speaks hex. Alpha is kept separately so
// translucent tokens such as `oklch(1 0 0 / 10%)` keep their transparency after editing.

export function parseOklch(
	value: string
): { l: number; c: number; h: number; alpha?: string } | undefined {
	const match =
		/^oklch\(\s*(\d*\.?\d+)(%?)\s+(\d*\.?\d+)\s+(\d*\.?\d+)(?:\s*\/\s*(\d*\.?\d+%?))?\s*\)$/.exec(
			value.trim()
		);
	if (!match) return undefined;
	const l = Number(match[1]) / (match[2] ? 100 : 1);
	return { l, c: Number(match[3]), h: Number(match[4]), alpha: match[5] };
}

const round = (n: number, digits: number) => {
	const value = Number(n.toFixed(digits));
	return Object.is(value, -0) ? 0 : value;
};

export function oklchToHex(value: string): string | undefined {
	const parsed = parseOklch(value);
	if (!parsed) return undefined;
	const { l, c, h } = parsed;
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const linear = [
		4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
		-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
		-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
	];
	return (
		"#" +
		linear
			.map((v) => {
				const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
				return Math.round(Math.min(1, Math.max(0, srgb)) * 255)
					.toString(16)
					.padStart(2, "0");
			})
			.join("")
	);
}

/** Converts `#rrggbb` to `oklch(L C H)`, keeping `alpha` (e.g. `10%`) when given. */
export function hexToOklch(hex: string, alpha?: string): string {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
		return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	}) as [number, number, number];
	const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
	const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
	const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
	const C = Math.hypot(A, B);
	// Grays have no meaningful hue; write `0 0` like the upstream themes do.
	const achromatic = C < 0.0005;
	let H = achromatic ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
	if (H < 0) H += 360;
	const body = `${round(L, 3)} ${achromatic ? 0 : round(C, 3)} ${achromatic ? 0 : round(H, 3)}`;
	return alpha ? `oklch(${body} / ${alpha})` : `oklch(${body})`;
}
