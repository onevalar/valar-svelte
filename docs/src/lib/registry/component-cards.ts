import { z } from "zod";

/**
 * Component cards: machine-readable "what is this, when to use it" data for AI tools, stored in
 * each component's `meta.json` (`src/lib/registry/ui/<name>/meta.json`). `meta.json` is the
 * existing registry mechanism, so the card also lands in `static/registry/<name>.json`.
 * The catalog, llms files, per-component markdown, the skill and the MCP server are generated
 * from these cards; do not repeat this information anywhere else.
 */
export const CARD_CATEGORIES = ["表单", "操作", "弹层", "导航", "反馈", "展示"] as const;

/**
 * Components that must have a card: every registry UI component. A new component without a
 * card is still listed as missing in the catalog output; add its card and its name here.
 */
export const REQUIRED_CARDS = [
	"button",
	"input",
	"textarea",
	"field",
	"select",
	"checkbox",
	"radio-group",
	"switch",
	"slider-field",
	"color-picker",
	"dialog",
	"alert-dialog",
	"sheet",
	"popover",
	"tooltip",
	"dropdown-menu",
	"tabs",
	"card",
	"alert",
	"sonner",
	// B1: overlays and form controls
	"hover-card",
	"context-menu",
	"drawer",
	"menubar",
	"command",
	"navigation-menu",
	"input-group",
	"input-otp",
	"native-select",
	"number-field",
	"tags-input",
	"slider",
	"toggle",
	"toggle-group",
	"form",
	"label",
	"calendar",
	"range-calendar",
	// B3: everything else
	"accordion",
	"aspect-ratio",
	"attachment",
	"avatar",
	"badge",
	"breadcrumb",
	"bubble",
	"button-group",
	"carousel",
	"chart",
	"collapsible",
	"empty",
	"item",
	"kbd",
	"marker",
	"message",
	"message-scroller",
	"pagination",
	"progress",
	"questionnaire",
	"resizable",
	"scroll-area",
	"separator",
	"sidebar",
	"skeleton",
	"spinner",
	"stepper",
	"table",
	"trace",
	"code-block",
] as const;

const line = z.string().min(2).max(200);

export const componentCardSchema = z
	.object({
		$schema: z.string().optional(),
		name: z.string().regex(/^[a-z][a-z0-9-]*$/),
		type: z.literal("registry:ui"),
		title: z.string().min(1).max(40),
		/** One sentence: what the component is for. */
		description: line,
		categories: z.array(z.enum(CARD_CATEGORIES)).length(1),
		registryDependencies: z.array(z.string()).optional(),
		meta: z
			.object({
				valar: z
					.object({
						/** Search words in Chinese and English, including what users call it. */
						keywords: z.array(z.string().min(1)).min(3),
						whenToUse: z.array(line).min(1),
						/** Each entry names the component to use instead, when there is one. */
						whenNotToUse: z
							.array(z.object({ case: line, use: z.string().optional() }).strict())
							.min(1),
						accessibility: z.array(line).min(1),
						responsive: z.array(line).min(1),
						related: z.array(z.string()).min(1),
					})
					.strict(),
			})
			.strict(),
	})
	.strict();
export type ComponentCard = z.infer<typeof componentCardSchema>;
