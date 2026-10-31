import { parseStyleCss } from "@valar/svelte-parity/inject-style-classes";
import { twMerge } from "cn";
import { z } from "zod";

/**
 * Component-level write-back into `src/lib/registry/styles/valar/style-<style>.css`.
 * Only Button's own size and radius-level classes may be written from the docs page;
 * global tokens (colors, `--radius`, type scale) belong to the theme configuration.
 */
export const BUTTON_OVERRIDE_CLASSES = [
	"cn-button",
	"cn-button-size-xs",
	"cn-button-size-sm",
	"cn-button-size-default",
	"cn-button-size-lg",
	"cn-button-size-icon-xs",
	"cn-button-size-icon-sm",
	"cn-button-size-icon",
	"cn-button-size-icon-lg",
] as const;

const UTILITY =
	/^(?:(?:h|size|px|gap)-\d+(?:\.(?:25|5|75))?|rounded-(?:none|sm|md|lg|xl|2xl|3xl|4xl|full))$/;

export const styleOverridePayloadSchema = z
	.object({
		style: z.string().regex(/^[a-z]+$/),
		classes: z.partialRecord(
			z.enum(BUTTON_OVERRIDE_CLASSES),
			z
				.string()
				.max(200)
				.refine((value) => {
					const tokens = value.trim().split(/\s+/);
					return tokens.length > 0 && tokens.every((token) => UTILITY.test(token));
				}, "只允许尺寸、间距和圆角档位工具类")
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
 * Button 文档页的“写回组件库”会重写本文件；也可以手动编辑。上游文件保持原样。
 */
.style-${style} {
${rules}}
`;
}

/**
 * Later writes replace conflicting utilities of the same kind (`h-11` replaces `h-9`)
 * and keep the rest, so earlier write-backs for other sizes are not lost.
 */
export function applyStyleOverrides(existingCss: string, payload: StyleOverridePayload): string {
	const map = parseStyleCss(existingCss);
	for (const [className, classes] of Object.entries(payload.classes)) {
		if (classes) map[className] = twMerge(map[className] ?? "", classes.trim());
	}
	return serializeStyleOverrides(payload.style, map);
}
