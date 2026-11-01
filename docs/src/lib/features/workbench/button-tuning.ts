import { z } from "zod";
import {
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	readRadiusLevel,
	spacing,
	type RadiusLevel,
	type TunerSpec,
} from "./tuner.js";

// Button's own parameters. Global tokens (colors, `--radius`, type scale) are read-only here
// and belong to the theme configuration, so every component stays consistent with them.
export const BUTTON_SIZES = [
	{ id: "xs", label: "特小", icon: "icon-xs" },
	{ id: "sm", label: "小", icon: "icon-sm" },
	{ id: "default", label: "默认", icon: "icon" },
	{ id: "lg", label: "大", icon: "icon-lg" },
] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number]["id"];

const SIZE_FIELDS = [
	{ field: "height", label: "高度", min: 16, max: 96 },
	{ field: "paddingX", label: "横向内边距", min: 0, max: 48 },
	{ field: "gap", label: "图文间距", min: 0, max: 24 },
] as const;
type SizeField = (typeof SIZE_FIELDS)[number]["field"];
export type SizeKey = `${ButtonSize}.${SizeField}`;

export const BUTTON_NUMBER_PARAMETERS = BUTTON_SIZES.flatMap((size) =>
	SIZE_FIELDS.map((field) => ({
		key: `${size.id}.${field.field}` as SizeKey,
		size: size.id,
		field: field.field,
		label: `${size.label} · ${field.label}（px）`,
		min: field.min,
		max: field.max,
	}))
);
const RADIUS_LABEL = "圆角档位";

export type ButtonValues = { radius: RadiusLevel } & Record<SizeKey, number>;
export type ButtonOverrides = Partial<ButtonValues>;

const valuesSchema = z
	.object({
		radius: z.enum(RADIUS_LEVELS),
		...(Object.fromEntries(
			BUTTON_NUMBER_PARAMETERS.map((p) => [p.key, z.number().int().min(p.min).max(p.max)])
		) as Record<SizeKey, z.ZodNumber>),
	})
	.strict();

/** Reads the rendered value of each size from unmodified probe buttons. */
function readButtonValues(probe: HTMLElement): ButtonValues {
	const values = {} as ButtonValues;
	for (const size of BUTTON_SIZES) {
		const button = probe.querySelector<HTMLElement>(`[data-probe-size="${size.id}"]`)!;
		const computed = getComputedStyle(button);
		values[`${size.id}.height`] = Math.round(parseFloat(computed.height));
		values[`${size.id}.paddingX`] = Math.round(parseFloat(computed.paddingLeft));
		values[`${size.id}.gap`] = Math.round(parseFloat(computed.columnGap) || 0);
	}
	values.radius =
		readRadiusLevel(
			probe.querySelector(`[data-probe-size="default"]`)!,
			probe.querySelector<HTMLElement>("[data-probe-radius]")!
		) ?? "lg";
	return values;
}

/** Live preview inside the docs page. Mirrors exactly what `buttonOverrideClasses` writes. */
export function buttonOverrideCss(scope: string, overrides: ButtonOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	for (const size of BUTTON_SIZES) {
		const self = `${scope} [data-slot="button"][data-size="${size.id}"]`;
		const height = safe[`${size.id}.height`];
		const padding = safe[`${size.id}.paddingX`];
		const gap = safe[`${size.id}.gap`];
		if (height !== undefined) {
			rules.push(`${self} { height: ${height}px; }`);
			rules.push(
				`${scope} [data-slot="button"][data-size="${size.icon}"] { width: ${height}px; height: ${height}px; }`
			);
		}
		if (gap !== undefined) rules.push(`${self} { column-gap: ${gap}px; }`);
		// Upstream keeps a tighter padding on the side that holds an icon; that stays.
		if (padding !== undefined) {
			rules.push(`${self}:not(:has([data-icon="inline-start"])) { padding-left: ${padding}px; }`);
			rules.push(`${self}:not(:has([data-icon="inline-end"])) { padding-right: ${padding}px; }`);
		}
	}
	if (safe.radius !== undefined)
		rules.push(
			`${scope} [data-slot="button"]:not([data-slot="button-group"] *) { border-radius: ${radiusCss(safe.radius)}; }`
		);
	return rules.join("\n");
}

/** Tailwind classes for Valar's style override file. Icon sizes follow their text size. */
export function buttonOverrideClasses(overrides: ButtonOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: Record<string, string[]> = {};
	const add = (className: string, utility: string) =>
		(classes[`cn-button-size-${className}`] ??= []).push(utility);
	for (const size of BUTTON_SIZES) {
		const height = safe[`${size.id}.height`];
		const padding = safe[`${size.id}.paddingX`];
		const gap = safe[`${size.id}.gap`];
		if (height !== undefined) {
			add(size.id, `h-${spacing(height)}`);
			add(size.icon, `size-${spacing(height)}`);
		}
		if (padding !== undefined) add(size.id, `px-${spacing(padding)}`);
		if (gap !== undefined) add(size.id, `gap-${spacing(gap)}`);
	}
	if (safe.radius !== undefined) {
		// Some styles give small sizes their own radius; one level keeps every size consistent.
		classes["cn-button"] = [`rounded-${safe.radius}`];
		for (const size of BUTTON_SIZES) {
			add(size.id, `rounded-${safe.radius}`);
			add(size.icon, `rounded-${safe.radius}`);
		}
	}
	return Object.fromEntries(
		Object.entries(classes).map(([className, list]) => [className, list.join(" ")])
	);
}

export const BUTTON_SPEC: TunerSpec<ButtonValues> = {
	component: "button",
	title: "Button",
	description: "尺寸参数作用于该尺寸的所有变体，图标按钮跟随同档高度",
	storageKey: "valar.button-styles.v2",
	group: "尺寸与圆角",
	parameters: [
		{
			kind: "select",
			key: "radius",
			label: RADIUS_LABEL,
			options: RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
		},
		...BUTTON_NUMBER_PARAMETERS.map((p) => ({ kind: "number" as const, ...p })),
	],
	valuesSchema: valuesSchema as z.ZodType<ButtonValues>,
	tokens: [
		["--radius", "圆角基数"],
		["--text-sm", "小号字"],
		["--primary", "主色"],
		["--background", "背景色"],
		["--foreground", "文字色"],
		["--border", "边框色"],
	],
	readBaseline: async (probe) => ({ values: readButtonValues(probe), context: undefined }),
	previewCss: (scope, overrides) => buttonOverrideCss(scope, overrides),
	overrideClasses: (overrides) => buttonOverrideClasses(overrides),
};
