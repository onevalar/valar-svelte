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
};

export const styleOverridePayloadSchema = z
	.object({
		style: z.string().regex(/^[a-z]+$/),
		classes: z.record(z.string(), z.string().max(300)).refine(
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
