import { mergeClasses, parseStyleCss } from "@valar/svelte-parity/inject-style-classes";
import { z } from "zod";

/**
 * Component-level write-back into `src/lib/registry/styles/valar/style-<style>.css`.
 * Each component editor may write only its own `cn-*` classes, and each class only the kinds
 * of utilities its parameters produce (sizes, spacing, radius level, motion tier, …). Colors,
 * arbitrary values and other components are rejected; global tokens (colors, `--radius`, type
 * scale, motion values) belong to the `/themes` page.
 */
const N = String.raw`\d+(?:\.(?:25|5|75))?`;
const RADIUS = "(?:none|sm|md|lg|xl|2xl|3xl|4xl|full)";
const TIER = "(?:fast|normal|slow)";
const BUTTON_UTILITY = new RegExp(`^(?:(?:h|size|px|gap)-${N}|rounded-${RADIUS})$`);
const DIALOG_CONTENT_UTILITY = new RegExp(
	`^(?:(?:p|gap)-${N}|rounded-${RADIUS}|sm:max-w-(?:sm|md|lg|xl|2xl)|duration-${TIER}|data-open:zoom-in-(?:90|95|100)|data-closed:zoom-out-(?:90|95|100))$`
);
const DIALOG_OVERLAY_UTILITY = new RegExp(
	`^(?:bg-black/(?:0|10|20|30|40|50|60|70|80)|duration-${TIER})$`
);
const DIALOG_FOOTER_UTILITY = new RegExp(`^(?:-m[xb]-${N}|p-${N}|rounded-b-${RADIUS})$`);
const SIDE = "(?:top|bottom|left|right)";
const POPOVER_CONTENT_UTILITY = new RegExp(
	`^(?:(?:p|gap)-${N}|rounded-${RADIUS}|duration-${TIER}|data-open:zoom-in-(?:90|95|100)|data-closed:zoom-out-(?:90|95|100)|data-\\[side=${SIDE}\\]:slide-in-from-${SIDE}-[0-4])$`
);
// Sheet's slide distance and overlay duration compete with literals in the component source,
// so they are only accepted with the important modifier (see `sheet-tuning.ts`).
const SHEET_CONTENT_UTILITY = new RegExp(
	`^(?:gap-${N}|duration-${TIER}|data-\\[side=(?:left|right)\\]:sm:max-w-(?:sm|md|lg|xl|2xl)|data-\\[side=${SIDE}\\]:data-(?:open:slide-in-from|closed:slide-out-to)-${SIDE}(?:-(?:4|6|10|16|24))?!)$`
);
const SHEET_OVERLAY_UTILITY = new RegExp(
	`^(?:bg-black/(?:0|10|20|30|40|50|60|70|80)|duration-${TIER}!)$`
);
const SHEET_PADDING_UTILITY = new RegExp(`^p-${N}$`);
const INPUT_UTILITY = new RegExp(`^(?:(?:h|px)-${N}|rounded-${RADIUS})$`);
const TEXTAREA_UTILITY = new RegExp(`^(?:(?:px|py)-${N}|rounded-${RADIUS})$`);
const SELECT_TRIGGER_UTILITY = new RegExp(
	`^(?:data-\\[size=(?:default|sm)\\]:h-${N}|pl-${N}|(?:data-\\[size=sm\\]:)?rounded-${RADIUS})$`
);
const ZOOM = "(?:90|95|100)";
const MENU_PANEL_UTILITY = `p-${N}|rounded-${RADIUS}|duration-${TIER}|data-open:zoom-in-${ZOOM}|data-closed:zoom-out-${ZOOM}`;
const DROPDOWN_MENU_CONTENT_UTILITY = new RegExp(`^(?:${MENU_PANEL_UTILITY}|min-w-${N})$`);
const DROPDOWN_MENU_SUB_CONTENT_UTILITY = new RegExp(`^(?:${MENU_PANEL_UTILITY})$`);
const DROPDOWN_MENU_ITEM_UTILITY = new RegExp(
	`^(?:(?:px|py|gap)-${N}|rounded-${RADIUS}|data-inset:pl-${N})$`
);
const DROPDOWN_MENU_CHOICE_UTILITY = new RegExp(
	`^(?:(?:pl|py|gap)-${N}|rounded-${RADIUS}|data-inset:pl-${N})$`
);
const DROPDOWN_MENU_LABEL_UTILITY = new RegExp(`^(?:px-${N}|data-inset:pl-${N})$`);
const DROPDOWN_MENU_SEPARATOR_UTILITY = new RegExp(`^-mx-${N}$`);
const TOOLTIP_CONTENT_UTILITY = new RegExp(
	`^(?:(?:px|py)-${N}|rounded-${RADIUS}|duration-${TIER}|data-open:zoom-in-${ZOOM}|data-\\[state=delayed-open\\]:zoom-in-${ZOOM}|data-closed:zoom-out-${ZOOM})$`
);
// Show delay in ms, read by `tooltip-provider.svelte` after flattening.
const TOOLTIP_PROVIDER_UTILITY = /^delay-(?:0|[1-9]\d{0,3})$/;

export const OVERRIDE_RULES: Record<string, RegExp> = {
	...Object.fromEntries(
		[
			"cn-button",
			"cn-button-size-xs",
			"cn-button-size-sm",
			"cn-button-size-default",
			"cn-button-size-lg",
			"cn-button-size-icon-xs",
			"cn-button-size-icon-sm",
			"cn-button-size-icon",
			"cn-button-size-icon-lg",
		].map((className) => [className, BUTTON_UTILITY])
	),
	"cn-dialog-content": DIALOG_CONTENT_UTILITY,
	"cn-dialog-overlay": DIALOG_OVERLAY_UTILITY,
	"cn-dialog-footer": DIALOG_FOOTER_UTILITY,
	"cn-popover-content": POPOVER_CONTENT_UTILITY,
	"cn-sheet-content": SHEET_CONTENT_UTILITY,
	"cn-sheet-overlay": SHEET_OVERLAY_UTILITY,
	"cn-sheet-header": SHEET_PADDING_UTILITY,
	"cn-sheet-footer": SHEET_PADDING_UTILITY,
	"cn-input": INPUT_UTILITY,
	"cn-textarea": TEXTAREA_UTILITY,
	"cn-select-trigger": SELECT_TRIGGER_UTILITY,
	"cn-dropdown-menu-content": DROPDOWN_MENU_CONTENT_UTILITY,
	"cn-dropdown-menu-sub-content": DROPDOWN_MENU_SUB_CONTENT_UTILITY,
	"cn-dropdown-menu-item": DROPDOWN_MENU_ITEM_UTILITY,
	"cn-dropdown-menu-sub-trigger": DROPDOWN_MENU_ITEM_UTILITY,
	"cn-dropdown-menu-checkbox-item": DROPDOWN_MENU_CHOICE_UTILITY,
	"cn-dropdown-menu-radio-item": DROPDOWN_MENU_CHOICE_UTILITY,
	"cn-dropdown-menu-label": DROPDOWN_MENU_LABEL_UTILITY,
	"cn-dropdown-menu-separator": DROPDOWN_MENU_SEPARATOR_UTILITY,
	"cn-tooltip-content": TOOLTIP_CONTENT_UTILITY,
	"cn-tooltip-provider": TOOLTIP_PROVIDER_UTILITY,
};

export const styleOverridePayloadSchema = z
	.object({
		style: z.string().regex(/^[a-z]+$/),
		classes: z.record(z.string(), z.string().max(600)).refine(
			(classes) =>
				Object.entries(classes).every(([className, value]) => {
					const rule = OVERRIDE_RULES[className];
					const tokens = value.trim().split(/\s+/);
					return rule && tokens[0] !== "" && tokens.every((token) => rule.test(token));
				}),
			"只允许组件自己的尺寸、间距、圆角档位和动效档位工具类"
		),
	})
	.strict();
export type StyleOverridePayload = z.infer<typeof styleOverridePayloadSchema>;

export function styleOverridePath(style: string): string {
	return `src/lib/registry/styles/valar/style-${style}.css`;
}

function styleLabel(style: string): string {
	return style.charAt(0).toUpperCase() + style.slice(1);
}

/** Every write regenerates the whole file from its parsed map, so the output stays canonical. */
export function serializeStyleOverrides(style: string, map: Record<string, string>): string {
	const rules = Object.entries(map)
		.map(([className, classes]) => `\t.${className} {\n\t\t@apply ${classes};\n\t}\n`)
		.join("\n");
	return `/*
 * Valar 定制样式（${styleLabel(style)}）。叠加在同名上游样式之上，冲突的工具类以此处为准。
 * 组件文档页的“写回组件库”会重写本文件；也可以手动编辑。上游文件保持原样。
 */
.style-${style} {
${rules}}
`;
}

/**
 * Later writes replace conflicting utilities of the same kind (`h-11` replaces `h-9`,
 * `duration-normal` replaces `duration-fast`)
 * and keep the rest, so earlier write-backs for other sizes are not lost.
 */
export function applyStyleOverrides(existingCss: string, payload: StyleOverridePayload): string {
	const map = parseStyleCss(existingCss);
	for (const [className, classes] of Object.entries(payload.classes)) {
		if (classes) map[className] = mergeClasses(map[className] ?? "", classes.trim());
	}
	return serializeStyleOverrides(payload.style, map);
}
