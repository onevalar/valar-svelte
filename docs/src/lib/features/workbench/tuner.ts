import { z } from "zod";

/**
 * Shared pieces of the full-screen component editors (Button, Dialog, …). Each component
 * supplies a `TunerSpec`: its parameters, how to read the library's current values, how to
 * preview a draft with CSS, and which classes "写回组件库" writes. Global tokens (colors,
 * `--radius`, type scale, motion tiers) stay read-only here; components only pick levels.
 */

// Most likely first: when the theme radius is 0 several levels compute equal.
export const RADIUS_LEVELS = ["lg", "md", "xl", "sm", "2xl", "3xl", "4xl", "full", "none"] as const;
export type RadiusLevel = (typeof RADIUS_LEVELS)[number];
export const RADIUS_LABELS: Record<RadiusLevel, string> = {
	none: "none · 直角",
	sm: "sm · 0.6 × 基数",
	md: "md · 0.8 × 基数",
	lg: "lg · 1 × 基数",
	xl: "xl · 1.4 × 基数",
	"2xl": "2xl · 1.8 × 基数",
	"3xl": "3xl · 2.2 × 基数",
	"4xl": "4xl · 2.6 × 基数",
	full: "full · 胶囊",
};
export function radiusCss(level: RadiusLevel): string {
	return level === "none"
		? "0"
		: level === "full"
			? "calc(infinity * 1px)"
			: `var(--radius-${level})`;
}

/** Tailwind spacing scale step for a pixel value (4px = 1). */
export const spacing = (px: number) => String(px / 4);

export type TunerParameter =
	| { kind: "number"; key: string; label: string; min: number; max: number; step?: number }
	| {
			kind: "select";
			key: string;
			label: string;
			options: readonly { value: string; label: string }[];
	  };

export type TunerValues = Record<string, string | number>;

export type TunerSpec<V extends TunerValues = TunerValues, C = unknown> = {
	/** Registry name, e.g. `button`. */
	component: string;
	/** Display name used in every accessible label, e.g. `Button`. */
	title: string;
	/** One line under the editor title. */
	description: string;
	storageKey: string;
	/** DialKit group title. */
	group: string;
	parameters: readonly TunerParameter[];
	valuesSchema: z.ZodType<V>;
	/** Global tokens shown read-only in the editor: [CSS variable, label]. */
	tokens: readonly (readonly [string, string])[];
	/**
	 * The library's current values for this style. `probe` holds unmodified instances
	 * rendered by the component's `probe` snippet and a `[data-probe-radius]` swatch.
	 * `context` carries style facts the write-back needs but the user does not edit.
	 */
	readBaseline(probe: HTMLElement, style: string): Promise<{ values: V; context: C }>;
	/** Live preview inside `scope`; must mirror exactly what `overrideClasses` writes. */
	previewCss(scope: string, overrides: Partial<V>, context: C): string;
	/** Classes for `styles/valar/style-<style>.css`, keyed by `cn-*` class. */
	overrideClasses(overrides: Partial<V>, context: C): Record<string, string>;
	/** Optional CSS that shows the selected saved version on the rest of the docs page. */
	pageCss?(overrides: Partial<V>, context: C): string;
};

export function versionSchemas<V extends TunerValues>(component: string, values: z.ZodType<V>) {
	const object = values as unknown as z.ZodObject;
	const version = z
		.object({
			format: z.literal(2),
			component: z.literal(component),
			id: z.string().uuid(),
			name: z.string().trim().min(1).max(60),
			createdAt: z.string().datetime(),
			source: z.object({ style: z.string().regex(/^style-[a-z]+$/) }).strict(),
			baseline: values,
			overrides: object.partial(),
		})
		.strict();
	return { version, versions: z.array(version).max(50) };
}
export type TunerVersion = {
	format: 2;
	component: string;
	id: string;
	name: string;
	createdAt: string;
	source: { style: string };
	baseline: TunerValues;
	overrides: Partial<TunerValues>;
};

export function changedValues<V extends TunerValues>(baseline: V, values: V): Partial<V> {
	return Object.fromEntries(
		Object.entries(values).filter(([key, value]) => baseline[key] !== value)
	) as Partial<V>;
}

/** Finds the radius level whose computed value matches `element`'s top-left radius. */
export function readRadiusLevel(element: Element, swatch: HTMLElement): RadiusLevel | undefined {
	const radius = getComputedStyle(element).borderTopLeftRadius;
	return RADIUS_LEVELS.find((level) => {
		swatch.style.borderRadius = radiusCss(level);
		return getComputedStyle(swatch).borderTopLeftRadius === radius;
	});
}
