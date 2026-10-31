import { z } from "zod";

export const COMPONENTS = [
	{ id: "button", title: "按钮", description: "尺寸、配色与悬停／按压反馈。" },
	{ id: "dialog", title: "对话框", description: "面板、遮罩、进出场与关闭行为。" },
	{ id: "tooltip", title: "提示", description: "位置、延迟、气泡外观与进出场。" },
	{ id: "accordion", title: "折叠面板", description: "间距、展开动效与单项／多项行为。" },
] as const;

export type ComponentId = (typeof COMPONENTS)[number]["id"];
export type ParameterValue = number | string | boolean;
export type Parameter = {
	key: string;
	label: string;
	group: string;
	component: "global" | ComponentId;
	description: string;
	defaultValue: ParameterValue;
	min?: number;
	max?: number;
	step?: number;
	options?: { value: string; label: string }[];
	type: "number" | "boolean" | "color" | "select" | "text";
};

function parameter(
	component: Parameter["component"],
	key: string,
	label: string,
	type: Parameter["type"],
	defaultValue: ParameterValue,
	extra: Partial<Parameter> = {}
): Parameter {
	return {
		key: `${component}.${key}`,
		component,
		label,
		group: key.startsWith("inherit")
			? "继承关系"
			: /Duration|duration|easing|offsetY|scale|Scale/.test(key)
				? "动效"
				: [
							"type",
							"disabled",
							"side",
							"sideOffset",
							"delayDuration",
							"closeOnEscape",
							"closeOnOutside",
							"showCloseButton",
					  ].includes(key)
					? "交互"
					: type === "color" || key === "overlayOpacity"
						? "配色"
						: "尺寸",
		type,
		defaultValue,
		description: `${label}；仅影响预览与导出的组件。`,
		...extra,
	};
}
const number = (
	c: Parameter["component"],
	k: string,
	l: string,
	d: number,
	min: number,
	max: number,
	step = 1
) => parameter(c, k, l, "number", d, { min, max, step });
const boolean = (
	c: Parameter["component"],
	k: string,
	l: string,
	d: boolean,
	description?: string
) => parameter(c, k, l, "boolean", d, description ? { description } : {});
const color = (c: Parameter["component"], k: string, l: string, d: string) =>
	parameter(c, k, l, "color", d);
const select = (
	c: Parameter["component"],
	k: string,
	l: string,
	d: string,
	options: { value: string; label: string }[]
) => parameter(c, k, l, "select", d, { options });
const easings = [
	{ value: "ease", label: "自然" },
	{ value: "linear", label: "线性" },
	{ value: "ease-in", label: "渐入" },
	{ value: "ease-out", label: "渐出" },
	{ value: "ease-in-out", label: "渐入渐出" },
];
const inheritRadius = (c: ComponentId) =>
	boolean(
		c,
		"inheritRadius",
		"继承全局圆角",
		true,
		"开启时使用全局圆角；关闭后使用本组件的独立圆角。"
	);
const inheritColors = (c: ComponentId) =>
	boolean(
		c,
		"inheritColors",
		"继承全局配色",
		true,
		"开启时使用全局背景／前景（按钮使用主色）；关闭后使用本组件配色。"
	);
const inheritMotion = (c: ComponentId) =>
	boolean(
		c,
		"inheritMotion",
		"继承全局动效",
		true,
		"开启时使用全局时长与缓动；关闭后使用本组件的独立动效参数。"
	);

export const PARAMETERS: Parameter[] = [
	number("global", "radius", "全局圆角（px）", 10, 0, 48),
	number("global", "fontSize", "全局字号（px）", 14, 10, 24),
	color("global", "background", "背景色", "#ffffff"),
	color("global", "foreground", "文字色", "#18181b"),
	color("global", "primary", "主色", "#6d28d9"),
	color("global", "primaryForeground", "主色文字", "#ffffff"),
	number("global", "motionDuration", "全局动效时长（ms）", 180, 0, 1200, 10),
	select("global", "easing", "全局缓动", "ease-out", easings),
	inheritRadius("button"),
	inheritColors("button"),
	inheritMotion("button"),
	number("button", "height", "高度（px）", 40, 24, 80),
	number("button", "paddingX", "水平内边距（px）", 20, 0, 64),
	number("button", "radius", "独立圆角（px）", 10, 0, 48),
	color("button", "bg", "独立背景", "#6d28d9"),
	color("button", "text", "独立文字", "#ffffff"),
	color("button", "hoverBg", "悬停背景", "#5b21b6"),
	number("button", "hoverScale", "悬停缩放", 1.03, 0.8, 1.2, 0.01),
	number("button", "pressedScale", "按压缩放", 0.97, 0.8, 1.2, 0.01),
	number("button", "duration", "过渡时长（ms）", 150, 0, 1200, 10),
	select("button", "easing", "过渡缓动", "ease-out", easings),
	inheritRadius("dialog"),
	inheritColors("dialog"),
	inheritMotion("dialog"),
	number("dialog", "width", "面板宽度（px）", 448, 240, 960, 8),
	number("dialog", "padding", "面板内边距（px）", 24, 0, 80),
	number("dialog", "radius", "独立圆角（px）", 16, 0, 48),
	color("dialog", "background", "独立背景", "#ffffff"),
	number("dialog", "overlayOpacity", "遮罩不透明度", 0.4, 0, 0.9, 0.01),
	number("dialog", "enterDuration", "进入时长（ms）", 220, 0, 1200, 10),
	number("dialog", "exitDuration", "退出时长（ms）", 160, 0, 1200, 10),
	number("dialog", "offsetY", "进出场纵向位移（px）", 12, -80, 80),
	number("dialog", "scale", "进出场起始缩放", 0.96, 0.5, 1.2, 0.01),
	select("dialog", "easing", "进出场缓动", "ease-out", easings),
	boolean("dialog", "closeOnEscape", "Escape 关闭", true),
	boolean("dialog", "closeOnOutside", "点击外部关闭", true),
	boolean("dialog", "showCloseButton", "显示关闭按钮", true),
	inheritRadius("tooltip"),
	inheritColors("tooltip"),
	inheritMotion("tooltip"),
	boolean("tooltip", "inheritFontSize", "继承全局字号", false),
	number("tooltip", "delayDuration", "显示延迟（ms）", 300, 0, 2000, 50),
	select("tooltip", "side", "优先位置（空间不足时自动避让）", "top", [
		{ value: "top", label: "上" },
		{ value: "right", label: "右" },
		{ value: "bottom", label: "下" },
		{ value: "left", label: "左" },
	]),
	number("tooltip", "sideOffset", "气泡间距（px）", 8, 0, 48),
	number("tooltip", "radius", "独立圆角（px）", 6, 0, 48),
	number("tooltip", "padding", "气泡内边距（px）", 8, 0, 32),
	number("tooltip", "fontSize", "独立字号（px）", 12, 10, 24),
	color("tooltip", "bg", "独立背景", "#18181b"),
	color("tooltip", "text", "独立文字", "#ffffff"),
	number("tooltip", "enterDuration", "进入时长（ms）", 140, 0, 1200, 10),
	number("tooltip", "exitDuration", "退出时长（ms）", 100, 0, 1200, 10),
	number("tooltip", "offsetY", "进出场纵向位移（px）", 4, -40, 40),
	number("tooltip", "scale", "进出场起始缩放", 0.96, 0.5, 1.2, 0.01),
	select("tooltip", "easing", "进出场缓动", "ease-out", easings),
	inheritRadius("accordion"),
	inheritMotion("accordion"),
	number("accordion", "spacing", "项目间距（px）", 8, 0, 48),
	number("accordion", "triggerPadding", "标题内边距（px）", 16, 0, 48),
	number("accordion", "contentPadding", "内容内边距（px）", 16, 0, 64),
	number("accordion", "radius", "独立圆角（px）", 10, 0, 48),
	color("accordion", "borderColor", "边框色", "#d4d4d8"),
	number("accordion", "duration", "展开／收起时长（ms）", 200, 0, 1200, 10),
	select("accordion", "easing", "展开／收起缓动", "ease-out", easings),
	select("accordion", "type", "展开方式", "single", [
		{ value: "single", label: "单项" },
		{ value: "multiple", label: "多项" },
	]),
	boolean("accordion", "disabled", "禁用交互", false),
];

// Numeric color grammars only. No custom properties, nested functions, named colors,
// CSS escapes, declarations, HTML, or external resources can enter the stylesheet.
const numeric = "[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)";
const channel = `${numeric}%?`;
const alpha = `(?:\\s*/\\s*${channel})?`;
const hue = `${numeric}(?:deg|rad|turn|grad)?`;
const colorPatterns = [
	new RegExp(`^rgba?\\(\\s*${channel}\\s+${channel}\\s+${channel}${alpha}\\s*\\)$`, "i"),
	new RegExp(
		`^rgba?\\(\\s*${channel}\\s*,\\s*${channel}\\s*,\\s*${channel}(?:\\s*,\\s*${channel})?\\s*\\)$`,
		"i"
	),
	new RegExp(`^hsla?\\(\\s*${hue}\\s+${numeric}%\\s+${numeric}%${alpha}\\s*\\)$`, "i"),
	new RegExp(
		`^hsla?\\(\\s*${hue}\\s*,\\s*${numeric}%\\s*,\\s*${numeric}%(?:\\s*,\\s*${channel})?\\s*\\)$`,
		"i"
	),
	new RegExp(`^oklch\\(\\s*${channel}\\s+${channel}\\s+${hue}${alpha}\\s*\\)$`, "i"),
	new RegExp(`^color\\(display-p3\\s+${channel}\\s+${channel}\\s+${channel}${alpha}\\s*\\)$`, "i"),
];
const safeColor = z
	.string()
	.trim()
	.max(120)
	.refine((value) => {
		if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return true;
		if (!colorPatterns.some((pattern) => pattern.test(value))) return false;
		// CSS clips out-of-gamut channels. Bound numeric magnitudes to keep serialized
		// values finite and practical without rejecting legitimate picker gamut output.
		return (value.match(new RegExp(numeric, "g")) ?? []).every(
			(part) => Math.abs(Number(part)) <= 10000
		);
	}, "请使用十六进制或纯数值 rgb / hsl / oklch / color(display-p3) 颜色");

const valueSchemas: Record<string, z.ZodType<ParameterValue>> = {};
for (const p of PARAMETERS) {
	valueSchemas[p.key] =
		p.type === "number"
			? z.number().min(p.min!).max(p.max!)
			: p.type === "boolean"
				? z.boolean()
				: p.type === "color"
					? safeColor
					: p.type === "select"
						? z.enum(p.options!.map((option) => option.value))
						: z.string().max(100);
}

/** No coercion, arbitrary CSS, missing keys, unknown keys, or executable expressions. */
export const presetSchema = z.strictObject({
	version: z.literal(1),
	name: z
		.string()
		.trim()
		.min(1)
		.max(80)
		.refine((name) =>
			[...name].every((char) => char.charCodeAt(0) >= 32 && char !== "<" && char !== ">")
		),
	values: z.strictObject(valueSchemas),
});
export type WorkbenchPreset = z.infer<typeof presetSchema>;
export const defaults: Record<string, ParameterValue> = Object.freeze(
	Object.fromEntries(PARAMETERS.map((p) => [p.key, p.defaultValue]))
);
export const defaultPreset: WorkbenchPreset = Object.freeze({
	version: 1,
	name: "我的设计预设",
	values: Object.freeze({ ...defaults }),
});

/** Each call returns a new validated object, independent of defaults and its input. */
export function parseWorkbenchPreset(input: unknown): WorkbenchPreset {
	const value: unknown = typeof input === "string" ? JSON.parse(input) : input;
	if (value && typeof value === "object" && "meta" in value) {
		const meta = (value as { meta?: unknown }).meta;
		if (meta && typeof meta === "object" && "workbenchPreset" in meta) {
			return presetSchema.parse(meta.workbenchPreset);
		}
	}
	return presetSchema.parse(value);
}
