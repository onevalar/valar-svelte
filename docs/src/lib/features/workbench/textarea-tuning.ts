import { z } from "zod";
import {
	CONTROL_RADII,
	CONTROL_TOKENS,
	RADIUS_OPTIONS,
	radiusLevel,
	readControlRadius,
} from "./control-tiers.js";
import { radiusCss, spacing, type TunerSpec } from "./tuner.js";

/**
 * Textarea's own parameters. Its height grows with the content and the minimum height lives in
 * the component source (`min-h-16`), so only the radius level and padding are tunable.
 */
const valuesSchema = z
	.object({
		radius: z.enum(CONTROL_RADII),
		paddingX: z.number().int().min(0).max(48),
		paddingY: z.number().int().min(0).max(48),
	})
	.strict();
export type TextareaValues = z.infer<typeof valuesSchema>;
export type TextareaOverrides = Partial<TextareaValues>;

/** Live preview; mirrors exactly what `textareaOverrideClasses` writes. */
export function textareaOverrideCss(scope: string, overrides: TextareaOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const radius = radiusLevel(safe.radius);
	if (radius !== undefined) rules.push(`border-radius: ${radiusCss(radius)};`);
	if (safe.paddingX !== undefined)
		rules.push(`padding-left: ${safe.paddingX}px; padding-right: ${safe.paddingX}px;`);
	if (safe.paddingY !== undefined)
		rules.push(`padding-top: ${safe.paddingY}px; padding-bottom: ${safe.paddingY}px;`);
	return rules.length ? `${scope} [data-slot="textarea"] { ${rules.join(" ")} }` : "";
}

export function textareaOverrideClasses(overrides: TextareaOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	const radius = radiusLevel(safe.radius);
	if (radius !== undefined) classes.push(`rounded-${radius}`);
	if (safe.paddingX !== undefined) classes.push(`px-${spacing(safe.paddingX)}`);
	if (safe.paddingY !== undefined) classes.push(`py-${spacing(safe.paddingY)}`);
	return classes.length ? { "cn-textarea": classes.join(" ") } : {};
}

export const TEXTAREA_SPEC: TunerSpec<TextareaValues> = {
	component: "textarea",
	title: "Textarea",
	description: "圆角与 Input、Button 同一套档位；高度随内容增长",
	storageKey: "valar.textarea-styles.v2",
	group: "留白与圆角",
	parameters: [
		{ kind: "select", key: "radius", label: "圆角档位", options: RADIUS_OPTIONS },
		{ kind: "number", key: "paddingX", label: "横向内边距（px）", min: 0, max: 48 },
		{ kind: "number", key: "paddingY", label: "纵向内边距（px）", min: 0, max: 48 },
	],
	valuesSchema,
	tokens: CONTROL_TOKENS,
	async readBaseline(probe) {
		const textarea = probe.querySelector<HTMLElement>('[data-slot="textarea"]')!;
		const computed = getComputedStyle(textarea);
		return {
			values: {
				radius: readControlRadius(
					textarea,
					probe.querySelector<HTMLElement>("[data-probe-radius]")!
				),
				paddingX: Math.round(parseFloat(computed.paddingLeft)),
				paddingY: Math.round(parseFloat(computed.paddingTop)),
			},
			context: undefined,
		};
	},
	previewCss: (scope, overrides) => textareaOverrideCss(scope, overrides),
	overrideClasses: (overrides) => textareaOverrideClasses(overrides),
};
