import { z } from "zod";
import {
	MOTION_TIER_LABELS,
	MOTION_TIERS,
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	radiusCss,
	sourceWord,
	spacing,
	STYLE_VALUE,
	tierVar,
	ZOOM_LEVELS,
	type RadiusLevel,
	type TunerSpec,
} from "./tuner.js";

/**
 * Tooltip's own parameters: padding, radius level, show delay and zoom on open. Colors, the
 * type scale, `--radius` and the motion tier values are global tokens; the tooltip only picks
 * levels. The show delay is a Provider prop, so the style carries it as `delay-<ms>` on
 * `cn-tooltip-provider`, which `tooltip-provider.svelte` reads after flattening.
 */
/** Upstream tooltips set no duration, so tw-animate's built-in 150ms applies. */
const STYLE_DURATION = "style";
const DURATION_OPTIONS = [STYLE_DURATION, ...MOTION_TIERS] as const;

const valuesSchema = z
	.object({
		paddingX: z.number().int().min(4).max(24).multipleOf(2),
		paddingY: z.number().int().min(2).max(12).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
		delay: z.number().int().min(0).max(1500).multipleOf(50),
		duration: z.enum(DURATION_OPTIONS),
		zoom: z.enum(ZOOM_LEVELS),
	})
	.strict();
export type TooltipValues = z.infer<typeof valuesSchema>;
export type TooltipOverrides = Partial<TooltipValues>;
/** The library's current delay, so the editor's hover sample uses it until it is changed. */
export type TooltipContext = { delay: number };

/** Reads the current values from the installed (flattened) Tooltip source of one style. */
export function parseTooltipSource(files: { target: string; content: string }[]): {
	values: TooltipValues;
	context: TooltipContext;
} {
	const file = (name: string) => files.find((f) => f.target.endsWith(`/${name}`))?.content ?? "";
	const content = /cn\(\s*"([^"]*)"/.exec(file("tooltip-content.svelte"))?.[1] ?? "";
	// The flattened provider holds the style's classes in `.exec("…")`; none means 0ms.
	const delay = Number(
		/exec\("[^"]*?\bdelay-(\d+)\b/.exec(file("tooltip-provider.svelte"))?.[1] ?? 0
	);
	const px = (pattern: string, fallback: number) => {
		const value = sourceWord(pattern, content);
		return value === undefined ? fallback : Number(value) * 4;
	};
	return {
		values: {
			paddingX: px(String.raw`px-(\d+(?:\.\d+)?)`, 12),
			paddingY: px(String.raw`py-(\d+(?:\.\d+)?)`, 6),
			radius:
				(sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, content) as RadiusLevel | undefined) ??
				STYLE_VALUE,
			delay,
			duration: (sourceWord("duration-(fast|normal|slow)", content) ??
				STYLE_DURATION) as TooltipValues["duration"],
			zoom: (/data-open:zoom-in-(\d+)/.exec(content)?.[1] ?? "100") as TooltipValues["zoom"],
		},
		context: { delay },
	};
}

// The built registry for every style; only the requested one is loaded.
const registryTooltips = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/tooltip.json",
	{ import: "default" }
);

/** Custom property the editor's hover sample reads as its Provider delay (ms). */
export const TOOLTIP_DELAY_VAR = "--valar-tooltip-delay";

function contentCss(content: string, overrides: TooltipOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const declarations: string[] = [];
	if (safe.paddingX !== undefined) declarations.push(`padding-inline: ${safe.paddingX}px;`);
	if (safe.paddingY !== undefined) declarations.push(`padding-block: ${safe.paddingY}px;`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		declarations.push(`border-radius: ${radiusCss(safe.radius)};`);
	if (safe.duration !== undefined && safe.duration !== STYLE_DURATION)
		declarations.push(`animation-duration: ${tierVar(safe.duration)};`);
	if (safe.zoom !== undefined)
		declarations.push(
			`--tw-enter-scale: ${Number(safe.zoom) / 100}; --tw-exit-scale: ${Number(safe.zoom) / 100};`
		);
	return declarations.length ? `${content} { ${declarations.join(" ")} }` : "";
}

const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export function tooltipOverrideClasses(overrides: TooltipOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	if (safe.paddingX !== undefined) content.push(`px-${spacing(safe.paddingX)}`);
	if (safe.paddingY !== undefined) content.push(`py-${spacing(safe.paddingY)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		content.push(`rounded-${safe.radius}`);
	if (safe.duration !== undefined && safe.duration !== STYLE_DURATION)
		content.push(`duration-${safe.duration}`);
	if (safe.zoom !== undefined)
		content.push(
			`data-open:zoom-in-${safe.zoom}`,
			`data-[state=delayed-open]:zoom-in-${safe.zoom}`,
			`data-closed:zoom-out-${safe.zoom}`
		);
	return Object.fromEntries(
		[
			["cn-tooltip-content", content],
			["cn-tooltip-provider", safe.delay !== undefined ? [`delay-${safe.delay}`] : []],
		]
			.filter(([, list]) => list.length)
			.map(([className, list]) => [className, (list as string[]).join(" ")])
	);
}

export const TOOLTIP_SPEC: TunerSpec<TooltipValues, TooltipContext> = {
	component: "tooltip",
	title: "Tooltip",
	description: "留白、圆角与显示延迟作用于所有提示；动效只选全局档位",
	storageKey: "valar.tooltip-styles.v2",
	group: "布局、延迟与动效",
	parameters: [
		{ kind: "number", key: "paddingX", label: "横向内边距（px）", min: 4, max: 24, step: 2 },
		{ kind: "number", key: "paddingY", label: "纵向内边距（px）", min: 2, max: 12, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
		{ kind: "number", key: "delay", label: "显示延迟（ms）", min: 0, max: 1500, step: 50 },
		{
			kind: "select",
			key: "duration",
			label: "动效档位",
			options: [
				{ value: STYLE_DURATION, label: "样式自带（150ms）" },
				...MOTION_TIERS.map((value) => ({ value, label: MOTION_TIER_LABELS[value] })),
			],
		},
		{
			kind: "select",
			key: "zoom",
			label: "出现时缩放",
			options: [
				{ value: "90", label: "90% · 明显" },
				{ value: "95", label: "95% · 轻微" },
				{ value: "100", label: "100% · 不缩放" },
			],
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--text-xs", "字号（xs 阶梯）"],
		["--motion-duration-fast", "快档时长"],
		["--motion-duration-normal", "中档时长"],
		["--foreground", "提示背景"],
		["--background", "提示文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryTooltips[`/src/__registry__/json/styles/${style.replace("style-", "")}/tooltip.json`];
		if (!load) throw new Error(`没有 ${style} 的 Tooltip registry`);
		return parseTooltipSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		[
			context
				? `${scope} { ${TOOLTIP_DELAY_VAR}: ${Number(overrides.delay ?? context.delay)}; }`
				: "",
			contentCss(`${scope} [data-slot="tooltip-content"]`, overrides),
		].join("\n"),
	// The delay is behavior, not CSS: the page sample keeps the library's delay.
	pageCss: (overrides) => contentCss(`[data-slot="tooltip-content"]${NOT_EDITOR}`, overrides),
	overrideClasses: (overrides) => tooltipOverrideClasses(overrides),
};
