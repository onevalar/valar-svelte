import { z } from "zod";

// These are mappings to existing CSS properties, not a second set of Button defaults.
// Values come from the rendered registry Button in its actual style/theme context.
export const BUTTON_PARAMETERS = [
	{ property: "height", label: "高度（px）", type: "number", min: 16, max: 96, unit: "px" },
	{
		property: "padding-left",
		label: "左内边距（px）",
		type: "number",
		min: 0,
		max: 64,
		unit: "px",
	},
	{
		property: "padding-right",
		label: "右内边距（px）",
		type: "number",
		min: 0,
		max: 64,
		unit: "px",
	},
	{
		property: "border-top-left-radius",
		label: "圆角（px）",
		type: "number",
		min: 0,
		max: 48,
		unit: "px",
		output: "border-radius",
	},
	{ property: "column-gap", label: "图文间距（px）", type: "number", min: 0, max: 40, unit: "px" },
	{ property: "font-size", label: "字号（px）", type: "number", min: 10, max: 32, unit: "px" },
	{
		property: "border-top-width",
		label: "边框宽度（px）",
		type: "number",
		min: 0,
		max: 8,
		unit: "px",
		output: "border-width",
	},
	{ property: "background-color", label: "默认背景", type: "color" },
	{ property: "color", label: "默认文字", type: "color" },
	{ property: "border-top-color", label: "默认边框", type: "color", output: "border-color" },
	{
		property: "transition-duration",
		label: "过渡时长（ms）",
		type: "number",
		min: 0,
		max: 1200,
		unit: "ms",
	},
	{ property: "transition-timing-function", label: "过渡缓动", type: "select" },
] as const;

export type ButtonProperty = (typeof BUTTON_PARAMETERS)[number]["property"];
export type ButtonValues = Record<ButtonProperty, string | number>;
export type ButtonOverrides = Partial<ButtonValues>;
export const BUTTON_STORAGE_KEY = "valar.button-styles.v1";

const color = z
	.string()
	.max(160)
	.regex(/^(?:#[\da-f]{3,8}|transparent|(?:rgba?|hsla?|oklch|oklab|color)\([\d\s.,%+\-/a-z]+\))$/i);
const easing = z
	.string()
	.max(120)
	.regex(/^(?:linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\(\s*[\d.,\s-]+\))$/);
const valueShape = Object.fromEntries(
	BUTTON_PARAMETERS.map((parameter) => [
		parameter.property,
		parameter.type === "number"
			? z.number().finite().min(parameter.min).max(parameter.max)
			: parameter.type === "color"
				? color
				: easing,
	])
) as Record<ButtonProperty, z.ZodString | z.ZodNumber>;
const valuesSchema = z.object(valueShape).strict();

export const buttonVersionSchema = z
	.object({
		format: z.literal(1),
		component: z.literal("button"),
		id: z.string().uuid(),
		name: z.string().trim().min(1).max(60),
		createdAt: z.string().datetime(),
		source: z
			.object({
				style: z.string().regex(/^style-[a-z]+$/),
				variant: z.string().regex(/^[a-z-]+$/),
				size: z.string().regex(/^[a-z-]+$/),
				theme: z.string().max(80),
				mode: z.enum(["light", "dark"]),
			})
			.strict(),
		baseline: valuesSchema,
		overrides: valuesSchema.partial(),
	})
	.strict();
export type ButtonVersion = z.infer<typeof buttonVersionSchema>;
export const buttonVersionsSchema = z.array(buttonVersionSchema).max(50);

export function readButtonValues(button: HTMLElement): ButtonValues {
	const computed = getComputedStyle(button);
	return Object.fromEntries(
		BUTTON_PARAMETERS.map((parameter) => {
			const raw = computed.getPropertyValue(parameter.property).trim();
			const value =
				parameter.type === "number"
					? parseFloat(raw) * (parameter.unit === "ms" && !raw.endsWith("ms") ? 1000 : 1)
					: raw;
			return [parameter.property, value];
		})
	) as ButtonValues;
}

export function buttonChanges(baseline: ButtonValues, values: ButtonValues): ButtonOverrides {
	return Object.fromEntries(
		BUTTON_PARAMETERS.filter(({ property }) => values[property] !== baseline[property]).map(
			({ property }) => [property, values[property]]
		)
	);
}

/** Only edited properties are emitted. Native hover/focus colors and focus rings remain intact. */
export function buttonOverrideCss(selector: string, overrides: ButtonOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	return BUTTON_PARAMETERS.flatMap((parameter) => {
		const value = safe[parameter.property];
		if (value === undefined) return [];
		const property = "output" in parameter ? parameter.output : parameter.property;
		const target =
			parameter.type === "color"
				? `${selector}:not(:hover):not(:active):not(:focus-visible)`
				: selector;
		const rule = `${target} { ${property}: ${value}${parameter.type === "number" ? parameter.unit : ""}; }`;
		return parameter.property.startsWith("transition-")
			? [`@media (prefers-reduced-motion: no-preference) { ${rule} }`]
			: [rule];
	}).join("\n");
}
