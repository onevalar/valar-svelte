import { BUTTON_SIZES, type ButtonSize } from "./button-tuning.js";
import {
	RADIUS_CHOICES,
	RADIUS_LABELS,
	RADIUS_LEVELS,
	readRadiusLevel,
	STYLE_VALUE,
	type RadiusLevel,
} from "./tuner.js";

export { STYLE_VALUE };

/**
 * Levels shared by the form-control editors (Input, Select, Textarea) so they stay aligned with
 * Button: heights are Button's size tiers, measured from real probe Buttons, and radius uses
 * Button's radius levels. A value that matches no level reads as "style" (样式自带) and is
 * never written back.
 */
export const HEIGHT_TIERS = [...BUTTON_SIZES.map((size) => size.id), STYLE_VALUE] as const;
export type HeightTier = (typeof HEIGHT_TIERS)[number];
export const CONTROL_RADII = RADIUS_CHOICES;
export type ControlRadius = (typeof CONTROL_RADII)[number];

export const HEIGHT_OPTIONS = [
	...BUTTON_SIZES.map((size) => ({ value: size.id, label: `同 Button ${size.label}` })),
	{ value: STYLE_VALUE, label: "样式自带" },
];
export const RADIUS_OPTIONS = [
	...RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
	{ value: STYLE_VALUE, label: "样式自带" },
];

/** Button's current height of every size; the write-back turns a tier into these pixels. */
export type ControlContext = { buttonHeights: Record<ButtonSize, number> };

/** Measures the probe Buttons rendered with `data-probe-button="<size>"`. */
export function readButtonHeights(probe: HTMLElement): Record<ButtonSize, number> {
	return Object.fromEntries(
		BUTTON_SIZES.map((size) => {
			const button = probe.querySelector(`[data-probe-button="${size.id}"]`)!;
			return [size.id, Math.round(parseFloat(getComputedStyle(button).height))];
		})
	) as Record<ButtonSize, number>;
}

/** The Button tier with this height; `preferred` wins when several tiers are equally tall. */
export function heightTier(
	height: number,
	buttonHeights: Record<ButtonSize, number>,
	preferred: ButtonSize
): HeightTier {
	const order = [
		preferred,
		...BUTTON_SIZES.map((size) => size.id).filter((id) => id !== preferred),
	];
	return order.find((id) => buttonHeights[id] === height) ?? STYLE_VALUE;
}

export function tierHeight(tier: HeightTier | undefined, context: ControlContext | undefined) {
	return tier === undefined || tier === STYLE_VALUE ? undefined : context?.buttonHeights[tier];
}

export function readControlRadius(element: Element, swatch: HTMLElement): ControlRadius {
	return readRadiusLevel(element, swatch) ?? STYLE_VALUE;
}

export function radiusLevel(radius: ControlRadius | undefined): RadiusLevel | undefined {
	return radius === undefined || radius === STYLE_VALUE ? undefined : radius;
}

export const CONTROL_TOKENS = [
	["--radius", "圆角基数"],
	["--text-sm", "小号字"],
	["--input", "输入框边框"],
	["--ring", "焦点环"],
	["--border-width", "边框粗细"],
	["--muted-foreground", "占位文字"],
] as const;
