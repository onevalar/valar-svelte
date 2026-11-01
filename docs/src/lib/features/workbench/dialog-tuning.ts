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
 * Dialog's own parameters. Colors, `--radius` and the motion tier values are global tokens;
 * here Dialog only picks levels (radius level, duration tier) and sets its own layout and
 * motion character (width, padding, gap, overlay opacity, zoom).
 */
export const DIALOG_WIDTHS = ["sm", "md", "lg", "xl", "2xl"] as const;
const WIDTH_REM: Record<(typeof DIALOG_WIDTHS)[number], number> = {
	sm: 24,
	md: 28,
	lg: 32,
	xl: 36,
	"2xl": 42,
};

const valuesSchema = z
	.object({
		width: z.enum(DIALOG_WIDTHS),
		padding: z.number().int().min(8).max(48).multipleOf(2),
		gap: z.number().int().min(4).max(40).multipleOf(2),
		radius: z.enum(RADIUS_CHOICES),
		overlay: z.number().int().min(0).max(80).multipleOf(10),
		duration: z.enum(MOTION_TIERS),
		zoom: z.enum(ZOOM_LEVELS),
	})
	.strict();
export type DialogValues = z.infer<typeof valuesSchema>;
export type DialogOverrides = Partial<DialogValues>;

/** Facts about the style the write-back needs: does the footer bleed to the dialog edges? */
export type DialogContext = { footerBleed: boolean; footerRounded: boolean };

/** Reads the current values from the installed (flattened) Dialog source of one style. */
export function parseDialogSource(files: { target: string; content: string }[]): {
	values: DialogValues;
	context: DialogContext;
} {
	const file = (name: string) => files.find((f) => f.target.endsWith(name))?.content ?? "";
	const content = file("dialog-content.svelte");
	const overlay = file("dialog-overlay.svelte");
	const footer = file("dialog-footer.svelte");
	const px = (pattern: string, fallback: number) => {
		const value = sourceWord(pattern, content);
		return value === undefined ? fallback : Number(value) * 4;
	};
	const radius = sourceWord(`rounded-(${RADIUS_LEVELS.join("|")})`, content) as
		| RadiusLevel
		| undefined;
	return {
		values: {
			width: (/sm:max-w-(sm|md|lg|xl|2xl)\b/.exec(content)?.[1] ?? "md") as DialogValues["width"],
			padding: px(String.raw`p-(\d+(?:\.5)?)`, 16),
			gap: px(String.raw`gap-(\d+(?:\.5)?)`, 16),
			radius: radius ?? STYLE_VALUE,
			overlay: Number(/bg-black\/(\d+)/.exec(overlay)?.[1] ?? 0),
			duration: (sourceWord("duration-(fast|normal|slow)", content) ??
				"fast") as DialogValues["duration"],
			zoom: (/data-open:zoom-in-(\d+)/.exec(content)?.[1] ?? "100") as DialogValues["zoom"],
		},
		context: { footerBleed: /(?:^|\s)-mx-/.test(footer), footerRounded: /rounded-b-/.test(footer) },
	};
}

// The built registry for every style; only the requested one is loaded.
const registryDialogs = import.meta.glob<{ files: { target: string; content: string }[] }>(
	"/src/__registry__/json/styles/*/dialog.json",
	{ import: "default" }
);

/**
 * Live preview. `content`/`overlay`/`footer` selectors are built from `scope`; editor dialogs
 * (`[data-component-tuner]`) are always excluded so tuning never restyles the editor itself.
 */
function dialogCss(
	select: (slot: string) => string,
	overrides: DialogOverrides,
	context: DialogContext | undefined
): string {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	const overlay: string[] = [];
	const footer: string[] = [];
	const rules: string[] = [];
	if (safe.width !== undefined)
		rules.push(
			`@media (min-width: 40rem) { ${select("dialog-content")} { max-width: ${WIDTH_REM[safe.width]}rem; } }`
		);
	if (safe.padding !== undefined) {
		content.push(`padding: ${safe.padding}px;`);
		if (context?.footerBleed)
			footer.push(
				`margin-inline: -${safe.padding}px; margin-bottom: -${safe.padding}px; padding: ${safe.padding}px;`
			);
	}
	if (safe.gap !== undefined) content.push(`gap: ${safe.gap}px;`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		const radius = radiusCss(safe.radius);
		content.push(`border-radius: ${radius};`);
		if (context?.footerRounded)
			footer.push(`border-bottom-left-radius: ${radius}; border-bottom-right-radius: ${radius};`);
	}
	if (safe.duration !== undefined) {
		content.push(`animation-duration: ${tierVar(safe.duration)};`);
		overlay.push(`animation-duration: ${tierVar(safe.duration)};`);
	}
	if (safe.zoom !== undefined)
		content.push(
			`--tw-enter-scale: ${Number(safe.zoom) / 100}; --tw-exit-scale: ${Number(safe.zoom) / 100};`
		);
	if (safe.overlay !== undefined) overlay.push(`background-color: rgb(0 0 0 / ${safe.overlay}%);`);
	if (content.length) rules.push(`${select("dialog-content")} { ${content.join(" ")} }`);
	if (overlay.length) rules.push(`${select("dialog-overlay")} { ${overlay.join(" ")} }`);
	if (footer.length) rules.push(`${select("dialog-footer")} { ${footer.join(" ")} }`);
	return rules.join("\n");
}

const NOT_EDITOR = ":not([data-component-tuner]):not([data-component-tuner] *)";

export function dialogOverrideClasses(
	overrides: DialogOverrides,
	context: DialogContext
): Record<string, string> {
	const safe = valuesSchema.partial().parse(overrides);
	const content: string[] = [];
	const overlay: string[] = [];
	const footer: string[] = [];
	if (safe.width !== undefined) content.push(`sm:max-w-${safe.width}`);
	if (safe.padding !== undefined) {
		content.push(`p-${spacing(safe.padding)}`);
		if (context.footerBleed)
			footer.push(
				`-mx-${spacing(safe.padding)}`,
				`-mb-${spacing(safe.padding)}`,
				`p-${spacing(safe.padding)}`
			);
	}
	if (safe.gap !== undefined) content.push(`gap-${spacing(safe.gap)}`);
	if (safe.radius !== undefined && safe.radius !== STYLE_VALUE) {
		content.push(`rounded-${safe.radius}`);
		if (context.footerRounded) footer.push(`rounded-b-${safe.radius}`);
	}
	if (safe.duration !== undefined) {
		content.push(`duration-${safe.duration}`);
		overlay.push(`duration-${safe.duration}`);
	}
	if (safe.zoom !== undefined)
		content.push(`data-open:zoom-in-${safe.zoom}`, `data-closed:zoom-out-${safe.zoom}`);
	if (safe.overlay !== undefined) overlay.push(`bg-black/${safe.overlay}`);
	return Object.fromEntries(
		[
			["cn-dialog-content", content],
			["cn-dialog-overlay", overlay],
			["cn-dialog-footer", footer],
		]
			.filter(([, list]) => list.length)
			.map(([className, list]) => [className, (list as string[]).join(" ")])
	);
}

export const DIALOG_SPEC: TunerSpec<DialogValues, DialogContext> = {
	component: "dialog",
	title: "Dialog",
	description: "宽度、留白与遮罩作用于所有对话框；动效只选全局档位",
	storageKey: "valar.dialog-styles.v2",
	group: "布局与动效",
	parameters: [
		{
			kind: "select",
			key: "width",
			label: "宽度（≥640px 时）",
			options: DIALOG_WIDTHS.map((value) => ({
				value,
				label: `${value} · ${WIDTH_REM[value] * 16}px`,
			})),
		},
		{ kind: "number", key: "padding", label: "内边距（px）", min: 8, max: 48, step: 2 },
		{ kind: "number", key: "gap", label: "内容间距（px）", min: 4, max: 40, step: 2 },
		{
			kind: "select",
			key: "radius",
			label: "圆角档位",
			options: [
				{ value: STYLE_VALUE, label: "样式自带" },
				...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
			],
		},
		{ kind: "number", key: "overlay", label: "遮罩不透明度（%）", min: 0, max: 80, step: 10 },
		{
			kind: "select",
			key: "duration",
			label: "动效档位",
			options: MOTION_TIERS.map((value) => ({ value, label: MOTION_TIER_LABELS[value] })),
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
		["--motion-duration-fast", "快档时长"],
		["--motion-duration-normal", "中档时长"],
		["--motion-ease-enter", "进入曲线"],
		["--popover", "面板背景"],
		["--border-width", "边框粗细"],
	],
	async readBaseline(_probe, style) {
		const load =
			registryDialogs[`/src/__registry__/json/styles/${style.replace("style-", "")}/dialog.json`];
		if (!load) throw new Error(`没有 ${style} 的 Dialog registry`);
		return parseDialogSource((await load()).files);
	},
	previewCss: (scope, overrides, context) =>
		dialogCss((slot) => `${scope} [data-slot="${slot}"]`, overrides, context),
	pageCss: (overrides, context) =>
		dialogCss((slot) => `[data-slot="${slot}"]${NOT_EDITOR}`, overrides, context),
	overrideClasses: dialogOverrideClasses,
};
