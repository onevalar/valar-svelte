import { z } from "zod";
import {
	CONTROL_RADII,
	CONTROL_TOKENS,
	HEIGHT_OPTIONS,
	HEIGHT_TIERS,
	RADIUS_OPTIONS,
	heightTier,
	radiusLevel,
	readButtonHeights,
	readControlRadius,
	tierHeight,
	type ControlContext,
} from "./control-tiers.js";
import { radiusCss, spacing, type TunerSpec } from "./tuner.js";

/**
 * Select trigger parameters. Its two sizes pick Button tiers of the same name by default; one
 * radius level applies to both sizes (as on Button). The chevron side keeps upstream padding.
 */
export const SELECT_SIZES = [
	{ id: "default", label: "默认" },
	{ id: "sm", label: "小" },
] as const;

const valuesSchema = z
	.object({
		"default.height": z.enum(HEIGHT_TIERS),
		"sm.height": z.enum(HEIGHT_TIERS),
		radius: z.enum(CONTROL_RADII),
		paddingStart: z.number().int().min(0).max(48),
	})
	.strict();
export type SelectValues = z.infer<typeof valuesSchema>;
export type SelectOverrides = Partial<SelectValues>;

/** Live preview; mirrors exactly what `selectOverrideClasses` writes. */
export function selectOverrideCss(
	scope: string,
	overrides: SelectOverrides,
	context: ControlContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const trigger = `${scope} [data-slot="select-trigger"]`;
	const rules: string[] = [];
	for (const size of SELECT_SIZES) {
		const height = tierHeight(safe[`${size.id}.height`], context);
		if (height !== undefined)
			rules.push(`${trigger}[data-size="${size.id}"] { height: ${height}px; }`);
	}
	const radius = radiusLevel(safe.radius);
	if (radius !== undefined) rules.push(`${trigger} { border-radius: ${radiusCss(radius)}; }`);
	if (safe.paddingStart !== undefined)
		rules.push(`${trigger} { padding-left: ${safe.paddingStart}px; }`);
	return rules.join("\n");
}

export function selectOverrideClasses(
	overrides: SelectOverrides,
	context: ControlContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	for (const size of SELECT_SIZES) {
		const height = tierHeight(safe[`${size.id}.height`], context);
		if (height !== undefined) classes.push(`data-[size=${size.id}]:h-${spacing(height)}`);
	}
	const radius = radiusLevel(safe.radius);
	// Some styles give the small size its own radius; one level keeps both sizes consistent.
	if (radius !== undefined) classes.push(`rounded-${radius}`, `data-[size=sm]:rounded-${radius}`);
	if (safe.paddingStart !== undefined) classes.push(`pl-${spacing(safe.paddingStart)}`);
	return classes.length ? { "cn-select-trigger": classes.join(" ") } : {};
}

export const SELECT_SPEC: TunerSpec<SelectValues, ControlContext> = {
	component: "select",
	title: "Select",
	description: "触发器两个尺寸使用 Button 的高度档位，圆角与 Button 同一套档位",
	storageKey: "valar.select-styles.v2",
	group: "触发器尺寸与圆角",
	parameters: [
		...SELECT_SIZES.map((size) => ({
			kind: "select" as const,
			key: `${size.id}.height`,
			label: `${size.label}尺寸高度`,
			options: HEIGHT_OPTIONS,
		})),
		{ kind: "select", key: "radius", label: "圆角档位", options: RADIUS_OPTIONS },
		{ kind: "number", key: "paddingStart", label: "文字侧内边距（px）", min: 0, max: 48 },
	],
	valuesSchema,
	tokens: CONTROL_TOKENS,
	async readBaseline(probe) {
		const buttonHeights = readButtonHeights(probe);
		const trigger = (size: string) =>
			probe.querySelector<HTMLElement>(`[data-slot="select-trigger"][data-size="${size}"]`)!;
		const height = (size: "default" | "sm") =>
			heightTier(
				Math.round(parseFloat(getComputedStyle(trigger(size)).height)),
				buttonHeights,
				size
			);
		return {
			values: {
				"default.height": height("default"),
				"sm.height": height("sm"),
				radius: readControlRadius(
					trigger("default"),
					probe.querySelector<HTMLElement>("[data-probe-radius]")!
				),
				paddingStart: Math.round(parseFloat(getComputedStyle(trigger("default")).paddingLeft)),
			},
			context: { buttonHeights },
		};
	},
	previewCss: selectOverrideCss,
	overrideClasses: selectOverrideClasses,
};
