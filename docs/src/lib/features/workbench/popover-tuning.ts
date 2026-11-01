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
 * Popover's own parameters. Colors, `--radius` and the motion tier values are global tokens;
 * Popover only picks levels (radius level, duration tier) and sets its own layout and motion
 * character (padding, gap, zoom and slide distance on open). Width and side offset are props
 * that callers set per use (`class="w-80"`, `sideOffset`), so they are not style parameters.
 */
/** Slide distance in px; written as tw-animate spacing steps (4px each). */
export const POPOVER_SLIDES = ["0", "4", "8", "12", "16"] as const;
/** The panel slides in from the trigger: opening below it starts slightly above, and so on. */
const SLIDE_FROM = {
	bottom: "top",
	top: "bottom",
	left: "right",
	right: "left",
} as const;

const valuesSchema = z
	.object({
		padding: z.number().int().min(4).max(32).multipleOf(2),
		gap: z.number().int().min(4).max(32).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
		duration: z.enum(MOTION_TIERS),
		zoom: z.enum(ZOOM_LEVELS),
		slide: z.enum(POPOVER_SLIDES),
	})
	.strict();
export type PopoverValues = z.infer<typeof valuesSchema>;
export type PopoverOverrides = Partial<PopoverValues>;

/** Reads the current values from the installed (flattened) Popover source of one style. */
export function parsePopoverSource(files: { target: string; content: string }[]): {
	values: PopoverValues;
	context: null;
} {
	const content = files.find((f) => f.target.endsWith("popover-content.svelte"))?.content ?? "";
	const px = (pattern: string, fallback: number) => {
		const value = sourceWord(pattern, content);
		return value === undefined ? fallback : Number(value) * 4;
	};
	const radius = sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, content) as
		| RadiusLevel
		| undefined;
	return {
		values: {
			padding: px(String.raw`p-(\d+(?:\.5)?)`, 16),
			gap: px(String.raw`gap-(\d+(?:\.5)?)`, 16),
			radius: radius ?? STYLE_VALUE,
			duration: (sourceWord("duration-(fast|normal|slow)", content) ??
				"fast") as PopoverValues["duration"],
			zoom: (/data-open:zoom-in-(\d+)/.exec(content)?.[1] ?? "100") as PopoverValues["zoom"],
			slide: String(
				Number(/data-\[side=bottom\]:slide-in-from-top-(\d+)/.exec(content)?.[1] ?? 0) * 4
			) as PopoverValues["slide"],
		},
		context: null,
	};
}

const registryPopovers = import.meta.glob<{
	files: { target: string; content: string }[];
}>("/src/__registry__/json/styles/*/popover.json", { import: "default" });

/** Live preview; mirrors `popoverOverrideClasses` (tw-animate's slide variables included). */
function popoverCss(select: string, overrides: PopoverOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	const rules: string[] = [];
	if (safe.padding !== undefined) content.push(`padding: ${safe.padding}px;`);
	if (safe.gap !== undefined) content.push(`gap: ${safe.gap}px;`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		content.push(`border-radius: ${radiusCss(safe.radius)};`);
	if (safe.duration !== undefined) content.push(`animation-duration: ${tierVar(safe.duration)};`);
	if (safe.zoom !== undefined)
		content.push(
			`--tw-enter-scale: ${Number(safe.zoom) / 100}; --tw-exit-scale: ${Number(safe.zoom) / 100};`
		);
	if (safe.slide !== undefined) {
		const distance = `calc(${spacing(Number(safe.slide))} * var(--spacing))`;
		rules.push(
			`${select}[data-side="bottom"] { --tw-enter-translate-y: calc(${distance} * -1); }`,
			`${select}[data-side="top"] { --tw-enter-translate-y: ${distance}; }`,
			`${select}[data-side="left"] { --tw-enter-translate-x: ${distance}; }`,
			`${select}[data-side="right"] { --tw-enter-translate-x: calc(${distance} * -1); }`
		);
	}
	if (content.length) rules.unshift(`${select} { ${content.join(" ")} }`);
	return rules.join("\n");
}

const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export function popoverOverrideClasses(overrides: PopoverOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	if (safe.padding !== undefined) content.push(`p-${spacing(safe.padding)}`);
	if (safe.gap !== undefined) content.push(`gap-${spacing(safe.gap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE)
		content.push(`rounded-${safe.radius}`);
	if (safe.duration !== undefined) content.push(`duration-${safe.duration}`);
	if (safe.zoom !== undefined)
		content.push(`data-open:zoom-in-${safe.zoom}`, `data-closed:zoom-out-${safe.zoom}`);
	if (safe.slide !== undefined)
		for (const [side, from] of Object.entries(SLIDE_FROM))
			content.push(`data-[side=${side}]:slide-in-from-${from}-${spacing(Number(safe.slide))}`);
	return content.length ? { "cn-popover-content": content.join(" ") } : {};
}

export const POPOVER_SPEC: TunerSpec<PopoverValues, null> = {
	component: "popover",
	title: "Popover",
	description: "留白、圆角与出现方式作用于所有浮层；动效只选全局档位",
	storageKey: "valar.popover-styles.v2",
	group: "布局与动效",
	parameters: [
		{
			kind: "number",
			key: "padding",
			label: "内边距（px）",
			min: 4,
			max: 32,
			step: 2,
		},
		{
			kind: "number",
			key: "gap",
			label: "内容间距（px）",
			min: 4,
			max: 32,
			step: 2,
		},
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({
					value,
					label: RADIUS_LABELS[value],
				})),
			],
		},
		{
			kind: "select",
			key: "duration",
			label: "动效档位",
			options: MOTION_TIERS.map((value) => ({
				value,
				label: MOTION_TIER_LABELS[value],
			})),
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
		{
			kind: "select",
			key: "slide",
			label: "出现时滑入距离",
			options: POPOVER_SLIDES.map((value) => ({
				value,
				label: value === "0" ? "0 · 不滑动" : `${value}px`,
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--radius", "圆角基数"],
		["--motion-duration-fast", "快档时长"],
		["--motion-duration-normal", "中档时长"],
		["--popover", "面板背景"],
		["--popover-foreground", "面板文字"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryPopovers[`/src/__registry__/json/styles/${style.replace("style-", "")}/popover.json`];
		if (!load) throw new Error(`没有 ${style} 的 Popover registry`);
		return parsePopoverSource((await load()).files);
	},
	previewCss: (scope, overrides) => popoverCss(`${scope} [data-slot="popover-content"]`, overrides),
	pageCss: (overrides) => popoverCss(`[data-slot="popover-content"]${NOT_EDITOR}`, overrides),
	overrideClasses: (overrides) => popoverOverrideClasses(overrides),
};
