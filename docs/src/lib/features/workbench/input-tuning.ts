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

/** Input's own parameters: a Button height tier, a radius level and horizontal padding. */
const valuesSchema = z
	.object({
		height: z.enum(HEIGHT_TIERS),
		radius: z.enum(CONTROL_RADII),
		paddingX: z.number().int().min(0).max(48),
	})
	.strict();
export type InputValues = z.infer<typeof valuesSchema>;
export type InputOverrides = Partial<InputValues>;

/** Live preview; mirrors exactly what `inputOverrideClasses` writes. */
export function inputOverrideCss(
	scope: string,
	overrides: InputOverrides,
	context: ControlContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const rules: string[] = [];
	const height = tierHeight(safe.height, context);
	const radius = radiusLevel(safe.radius);
	if (height !== undefined) rules.push(`height: ${height}px;`);
	if (radius !== undefined) rules.push(`border-radius: ${radiusCss(radius)};`);
	if (safe.paddingX !== undefined)
		rules.push(`padding-left: ${safe.paddingX}px; padding-right: ${safe.paddingX}px;`);
	return rules.length ? `${scope} [data-slot="input"] { ${rules.join(" ")} }` : "";
}

export function inputOverrideClasses(
	overrides: InputOverrides,
	context: ControlContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const classes: string[] = [];
	const height = tierHeight(safe.height, context);
	const radius = radiusLevel(safe.radius);
	if (height !== undefined) classes.push(`h-${spacing(height)}`);
	if (radius !== undefined) classes.push(`rounded-${radius}`);
	if (safe.paddingX !== undefined) classes.push(`px-${spacing(safe.paddingX)}`);
	return classes.length ? { "cn-input": classes.join(" ") } : {};
}

export const INPUT_SPEC: TunerSpec<InputValues, ControlContext> = {
	component: "input",
	title: "Input",
	description: "高度与圆角使用 Button 的同一套档位，和按钮并排时保持对齐",
	storageKey: "valar.input-styles.v2",
	group: "尺寸与圆角",
	parameters: [
		{ kind: "select", key: "height", label: "高度档位", options: HEIGHT_OPTIONS },
		{ kind: "select", key: "radius", label: "圆角档位", options: RADIUS_OPTIONS },
		{ kind: "number", key: "paddingX", label: "横向内边距（px）", min: 0, max: 48 },
	],
	valuesSchema,
	tokens: CONTROL_TOKENS,
	async readBaseline(probe) {
		const input = probe.querySelector<HTMLElement>('[data-slot="input"]')!;
		const buttonHeights = readButtonHeights(probe);
		const computed = getComputedStyle(input);
		return {
			values: {
				height: heightTier(Math.round(parseFloat(computed.height)), buttonHeights, "default"),
				radius: readControlRadius(input, probe.querySelector<HTMLElement>("[data-probe-radius]")!),
				paddingX: Math.round(parseFloat(computed.paddingLeft)),
			},
			context: { buttonHeights },
		};
	},
	previewCss: inputOverrideCss,
	overrideClasses: inputOverrideClasses,
};
