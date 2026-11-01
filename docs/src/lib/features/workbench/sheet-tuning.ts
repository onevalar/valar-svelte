import { z } from "zod";
import {
	MOTION_TIER_LABELS,
	MOTION_TIERS,
	sourceWord,
	spacing,
	tierVar,
	type TunerSpec,
} from "./tuner.js";

/**
 * Sheet's own parameters. Colors and the motion tier values are global tokens; Sheet only
 * picks a duration tier and sets its own layout and motion character (side panel width,
 * padding, gap, overlay opacity and how far the panel slides in).
 *
 * Upstream hard-codes the slide distance in `sheet-content.svelte` (`slide-in-from-right-10`)
 * and the overlay duration in `sheet-overlay.svelte` (`duration-100`). A style utility of the
 * same kind would not reliably win over those literals, so these two are written with
 * Tailwind's important modifier (`…-16!`). Callers can still override them with `…!` classes.
 */
export const SHEET_WIDTHS = ["sm", "md", "lg", "xl", "2xl"] as const;
const WIDTH_REM: Record<(typeof SHEET_WIDTHS)[number], number> = {
	sm: 24,
	md: 28,
	lg: 32,
	xl: 36,
	"2xl": 42,
};
/** Slide distance in px (written as tw-animate spacing steps of 4px); `full` = whole panel. */
export const SHEET_SLIDES = ["16", "24", "40", "64", "96", "full"] as const;
export const SHEET_SIDES = ["right", "left", "bottom", "top"] as const;
type Side = (typeof SHEET_SIDES)[number];
/** Direction of the offset each side starts from: right/bottom positive, left/top negative. */
const SIDE_AXIS: Record<Side, ["x" | "y", 1 | -1]> = {
	right: ["x", 1],
	left: ["x", -1],
	bottom: ["y", 1],
	top: ["y", -1],
};

const valuesSchema = z
	.object({
		width: z.enum(SHEET_WIDTHS),
		padding: z.number().int().min(8).max(48).multipleOf(2),
		gap: z.number().int().min(0).max(40).multipleOf(2),
		overlay: z.number().int().min(0).max(80).multipleOf(10),
		duration: z.enum(MOTION_TIERS),
		slide: z.enum(SHEET_SLIDES),
	})
	.strict();
export type SheetValues = z.infer<typeof valuesSchema>;
export type SheetOverrides = Partial<SheetValues>;

/** Reads the current values from the installed (flattened) Sheet source of one style. */
export function parseSheetSource(files: { target: string; content: string }[]): {
	values: SheetValues;
	context: null;
} {
	const file = (name: string) => files.find((f) => f.target.endsWith(name))?.content ?? "";
	const content = file("sheet-content.svelte");
	const header = file("sheet-header.svelte");
	const overlay = file("sheet-overlay.svelte");
	const px = (pattern: string, source: string, fallback: number) => {
		const value = sourceWord(pattern, source);
		return value === undefined ? fallback : Number(value) * 4;
	};
	// An important override (from a write-back) wins over the component's own literal.
	const slides = [
		...content.matchAll(/data-\[side=right\]:data-open:slide-in-from-right(?:-(\d+))?(!?)/g),
	];
	const slide = slides.find((match) => match[2]) ?? slides[0];
	return {
		values: {
			width: (/data-\[side=right\]:sm:max-w-(sm|md|lg|xl|2xl)\b/.exec(content)?.[1] ??
				"sm") as SheetValues["width"],
			padding: px(String.raw`p-(\d+(?:\.5)?)`, header, 16),
			gap: px(String.raw`gap-(\d+(?:\.5)?)`, content, 0),
			overlay: Number(/bg-black\/(\d+)/.exec(overlay)?.[1] ?? 0),
			duration: (sourceWord("duration-(fast|normal|slow)", content) ??
				"normal") as SheetValues["duration"],
			slide: (slide
				? slide[1] === undefined
					? "full"
					: String(Number(slide[1]) * 4)
				: "40") as SheetValues["slide"],
		},
		context: null,
	};
}

const registrySheets = import.meta.glob<{
	files: { target: string; content: string }[];
}>("/src/__registry__/json/styles/*/sheet.json", { import: "default" });

/**
 * Live preview; mirrors `sheetOverrideClasses`. The slide rules are important and live in the
 * `base` layer: there they beat both the component's slide literal and an earlier important
 * write-back (`.style-* .cn-sheet-content`, also in `base`) through higher specificity.
 */
function sheetCss(select: (slot: string) => string, overrides: SheetOverrides): string {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	const overlay: string[] = [];
	const rules: string[] = [];
	if (safe.width !== undefined)
		rules.push(
			`@media (min-width: 40rem) { ${["left", "right"].map((side) => `${select("sheet-content")}[data-side="${side}"]`).join(", ")} { max-width: ${WIDTH_REM[safe.width]}rem; } }`
		);
	if (safe.padding !== undefined)
		rules.push(
			`${select("sheet-header")}, ${select("sheet-footer")} { padding: ${safe.padding}px; }`
		);
	if (safe.gap !== undefined) content.push(`gap: ${safe.gap}px;`);
	if (safe.duration !== undefined) {
		content.push(`animation-duration: ${tierVar(safe.duration)};`);
		overlay.push(`animation-duration: ${tierVar(safe.duration)};`);
	}
	if (safe.overlay !== undefined) overlay.push(`background-color: rgb(0 0 0 / ${safe.overlay}%);`);
	if (content.length) rules.push(`${select("sheet-content")} { ${content.join(" ")} }`);
	if (overlay.length) rules.push(`${select("sheet-overlay")} { ${overlay.join(" ")} }`);
	if (safe.slide !== undefined) {
		const distance =
			safe.slide === "full" ? "100%" : `calc(${spacing(Number(safe.slide))} * var(--spacing))`;
		const slides = SHEET_SIDES.map((side) => {
			const [axis, sign] = SIDE_AXIS[side];
			const value = sign === 1 ? distance : `calc(${distance} * -1)`;
			return `${select("sheet-content")}[data-side="${side}"] { --tw-enter-translate-${axis}: ${value} !important; --tw-exit-translate-${axis}: ${value} !important; }`;
		});
		rules.push(`@layer base { ${slides.join(" ")} }`);
	}
	return rules.join("\n");
}

const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export function sheetOverrideClasses(overrides: SheetOverrides): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	const overlay: string[] = [];
	const header: string[] = [];
	if (safe.width !== undefined)
		content.push(
			`data-[side=left]:sm:max-w-${safe.width}`,
			`data-[side=right]:sm:max-w-${safe.width}`
		);
	if (safe.padding !== undefined) header.push(`p-${spacing(safe.padding)}`);
	if (safe.gap !== undefined) content.push(`gap-${spacing(safe.gap)}`);
	if (safe.duration !== undefined) {
		content.push(`duration-${safe.duration}`);
		overlay.push(`duration-${safe.duration}!`);
	}
	if (safe.slide !== undefined) {
		const suffix = safe.slide === "full" ? "" : `-${spacing(Number(safe.slide))}`;
		for (const side of SHEET_SIDES)
			content.push(
				`data-[side=${side}]:data-open:slide-in-from-${side}${suffix}!`,
				`data-[side=${side}]:data-closed:slide-out-to-${side}${suffix}!`
			);
	}
	if (safe.overlay !== undefined) overlay.push(`bg-black/${safe.overlay}`);
	return Object.fromEntries(
		[
			["cn-sheet-content", content],
			["cn-sheet-overlay", overlay],
			["cn-sheet-header", header],
			["cn-sheet-footer", header],
		]
			.filter(([, list]) => list.length)
			.map(([className, list]) => [className, (list as string[]).join(" ")])
	);
}

export const SHEET_SPEC: TunerSpec<SheetValues, null> = {
	component: "sheet",
	title: "Sheet",
	description: "宽度、留白、遮罩与滑入距离作用于所有侧边面板；动效只选全局档位",
	storageKey: "valar.sheet-styles.v2",
	group: "布局与动效",
	parameters: [
		{
			kind: "select",
			key: "width",
			label: "左右侧宽度",
			options: SHEET_WIDTHS.map((value) => ({
				value,
				label: `${value} · ${WIDTH_REM[value] * 16}px`,
			})),
		},
		{
			kind: "number",
			key: "padding",
			label: "页眉页脚内边距（px）",
			min: 8,
			max: 48,
			step: 2,
		},
		{
			kind: "number",
			key: "gap",
			label: "内容间距（px）",
			min: 0,
			max: 40,
			step: 2,
		},
		{
			kind: "number",
			key: "overlay",
			label: "遮罩不透明度（%）",
			min: 0,
			max: 80,
			step: 10,
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
			key: "slide",
			label: "滑入距离",
			options: SHEET_SLIDES.map((value) => ({
				value,
				label: value === "full" ? "整个面板" : `${value}px`,
			})),
		},
	],
	valuesSchema,
	tokens: [
		["--motion-duration-fast", "快档时长"],
		["--motion-duration-normal", "中档时长"],
		["--motion-duration-slow", "慢档时长"],
		["--motion-ease-standard", "标准曲线"],
		["--popover", "面板背景"],
		["--border-width", "边框粗细"],
	],
	async readBaseline(_probe, style) {
		const load =
			registrySheets[`/src/__registry__/json/styles/${style.replace("style-", "")}/sheet.json`];
		if (!load) throw new Error(`没有 ${style} 的 Sheet registry`);
		return parseSheetSource((await load()).files);
	},
	previewCss: (scope, overrides) => sheetCss((slot) => `${scope} [data-slot="${slot}"]`, overrides),
	pageCss: (overrides) => sheetCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides),
	overrideClasses: (overrides) => sheetOverrideClasses(overrides),
};
