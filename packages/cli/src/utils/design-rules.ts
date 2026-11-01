import path from "node:path";
import { existsSync, promises as fs } from "node:fs";

/**
 * Valar ships design rules with its components (`<component>/RULES.md`) so that AI agents
 * working in a consumer project follow them without looking for a separate guide:
 * `add` copies them into a managed block of the project's AGENTS.md, and `lint`
 * reports the rules that can be checked mechanically.
 */

export const RULES_START = "<!-- valar-svelte:rules:start -->";
export const RULES_END = "<!-- valar-svelte:rules:end -->";

const GLOBAL_RULES = `- 颜色只用语义 token 类，如 \`bg-primary\`、\`text-muted-foreground\`、\`border-border\`；不要用调色板色值（\`bg-blue-500\`）、黑白（\`bg-white\`）或十六进制（检查规则 \`valar/semantic-color\`）。
- 圆角、字号、间距用 \`rounded-*\`、\`text-*\` 等档位，它们跟随全局 token；不要写 \`h-[37px]\` 这类像素任意值（检查规则 \`valar/no-arbitrary-px\`）。
- 动效只用全局档位：时长 \`duration-fast\`／\`duration-normal\`／\`duration-slow\`，曲线 \`ease-enter\`／\`ease-exit\`／\`ease-standard\`；悬停等反馈直接用 \`transition\`。不要写 \`duration-250\`、\`ease-[cubic-bezier(...)]\` 这类写死的值（检查规则 \`valar/motion-token\`）。什么场景用哪一档，以 Valar 技能包中的动效指南为准；可参照已安装组件的现有用法（提示、菜单、弹窗用 fast，侧边面板用 normal）。边框用 \`border\`，粗细跟随全局 token。
- 图片都要有 \`alt\`，纯装饰的图片写 \`alt=""\`（检查规则 \`valar/image-alt\`）。
- 先用已安装的组件及其 \`variant\`、\`size\`，再考虑自定义样式；需要新组件时用 CLI 安装，不要手写一个相似的。
- 选组件前查组件说明卡里的“何时用／何时不用”：Valar MCP（\`valar-svelte mcp\` 的 search_components、get_component），或文档站的 \`llms-small.txt\`、registry 的 \`catalog.json\`。
- 改完界面后运行 \`valar-svelte lint\`（用项目的包运行器，如 \`pnpm exec valar-svelte lint\`），修正所有 error。`;

/** Builds the managed AGENTS.md block from every installed component's RULES.md. */
export async function buildRulesBlock(uiDir: string, cwd: string): Promise<string> {
	const sections: string[] = [];
	const entries = existsSync(uiDir) ? await fs.readdir(uiDir, { withFileTypes: true }) : [];
	for (const entry of entries
		.filter((e) => e.isDirectory())
		.sort((a, b) => a.name.localeCompare(b.name))) {
		const file = path.join(uiDir, entry.name, "RULES.md");
		if (!existsSync(file)) continue;
		const body = (await fs.readFile(file, "utf8"))
			.trim()
			// Nest each component's own top-level heading under this block.
			.replace(
				/^# (.+)$/m,
				`### $1\n\n来源：\`${path.relative(cwd, file).split(path.sep).join("/")}\``
			);
		sections.push(body);
	}
	return [
		RULES_START,
		"## Valar 设计规范",
		"",
		"由 valar-svelte 根据已安装组件自动生成，安装或更新组件时会重写本区块，请勿手动修改区块内容。编写或修改界面前先阅读并遵守。",
		"",
		"### 通用",
		"",
		GLOBAL_RULES,
		...sections.flatMap((section) => ["", section]),
		RULES_END,
	].join("\n");
}

/** Writes or replaces the managed block in `<cwd>/AGENTS.md`, keeping everything else. */
export async function updateAgentsRules(uiDir: string, cwd: string): Promise<string> {
	const target = path.join(cwd, "AGENTS.md");
	const block = await buildRulesBlock(uiDir, cwd);
	const existing = existsSync(target) ? await fs.readFile(target, "utf8") : "";
	const start = existing.indexOf(RULES_START);
	const end = existing.indexOf(RULES_END);
	const next =
		start !== -1 && end > start
			? existing.slice(0, start) + block + existing.slice(end + RULES_END.length)
			: `${existing.trimEnd()}${existing.trim() ? "\n\n" : ""}${block}\n`;
	if (next !== existing) await fs.writeFile(target, next, "utf8");
	return target;
}

export type LintFinding = {
	file: string;
	line: number;
	rule: string;
	severity: "error" | "warning";
	message: string;
};

const PALETTE =
	"slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
	"bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow";
const RAW_COLOR = new RegExp(
	`(?<![\\w-])(?:[\\w-]+:)*(?:${COLOR_UTILITIES})-(?:(?:${PALETTE})-\\d{2,3}|black|white|\\[#[\\da-fA-F]{3,8}\\])(?:\\/\\d+)?(?![\\w-])`,
	"g"
);
const ARBITRARY_PX =
	/(?<![\w-])(?:[\w-]+:)*(?:min-|max-)?(?:h|w|size|p[xytrbl]?|m[xytrbl]?|gap|rounded|text|leading)-\[\d+(?:\.\d+)?px\](?![\w-])/g;
// Motion uses the global tiers (`duration-fast|normal|slow`, `ease-enter|exit|standard`).
const MOTION_LITERAL =
	/(?<![\w-])(?:[\w-]+:)*(?:duration-(?:\d+|\[[^\]\s]+\])|ease-(?:in|out|in-out|\[[^\]\s]+\]))(?![\w-])/g;
const BUTTON_LAYOUT = /^(?:[\w-]+:)*-?(?:min-h|h|px|py|size|rounded)(?:-|$)/;
// A red border or ring set directly instead of through `aria-invalid`.
const INVALID_CLASS = /^(?:[\w-]+:)*(?:border|ring|outline)-destructive(?:\/\d+)?$/;
const CHART_LITERAL_COLOR = /\bcolor\s*:\s*["'`](?:#[\da-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/g;
const HAS_LABEL = /\s(?:aria-label|aria-labelledby)\s*=|\{\.\.\./;

/** The two ways a component part is written: `Dialog.Content` (namespace import) or `DialogContent`. */
const part = (ns: string, name: string) => [`${ns}.${name}`, `${ns}${name}`];

// Form controls whose label comes from `Field.Label for={id}` or aria-label (`valar/input-label`).
const LABELLED_CONTROLS = [
	"Input",
	"Textarea",
	...part("InputGroup", "Input"),
	...part("InputGroup", "Textarea"),
	"NumberField",
	"TagsInput",
	...part("Select", "Trigger"),
	"NativeSelect",
	...part("NativeSelect", "Root"),
	"Checkbox",
	"Switch",
	...part("RadioGroup", "Item"),
];
// Components that take Button's `size` (`valar/button-size-via-prop`).
const BUTTON_LIKE = [
	"Button",
	...part("AlertDialog", "Action"),
	...part("AlertDialog", "Cancel"),
	...part("InputGroup", "Button"),
	...part("Attachment", "Action"),
];
// Bits UI / Vaul triggers that render their own <button> (`valar/trigger-child-snippet`).
const BUTTON_TRIGGERS = [
	"Dialog",
	"AlertDialog",
	"Sheet",
	"Drawer",
	"Popover",
	"Tooltip",
	"DropdownMenu",
	"Menubar",
	"Collapsible",
	"NavigationMenu",
	"Accordion",
	"Tabs",
	"Select",
].flatMap((ns) => part(ns, "Trigger"));
const NATIVE_FORM: Record<string, string> = {
	input: "Input（复选、单选、范围、颜色分别用 Checkbox、RadioGroup、Slider、ColorPicker）",
	textarea: "Textarea",
	select: "NativeSelect 或 Select",
};

/** Returns the source of each `<Tag ...>` opening tag, skipping `>` inside quotes and `{}`. */
function openingTags(source: string, tag: string): { text: string; index: number }[] {
	const result: { text: string; index: number }[] = [];
	const pattern = new RegExp(`<${tag.replace(".", "\\.")}(?=[\\s/>])`, "g");
	for (const match of source.matchAll(pattern)) {
		let depth = 0;
		let quote = "";
		let i = match.index + match[0].length;
		for (; i < source.length; i++) {
			const char = source[i]!;
			if (quote) {
				if (char === quote) quote = "";
			} else if (char === '"' || char === "'" || char === "`") quote = char;
			else if (char === "{") depth++;
			else if (char === "}") depth--;
			else if (char === ">" && depth === 0) break;
		}
		result.push({ text: source.slice(match.index, i + 1), index: match.index });
	}
	return result;
}

/** The markup between an opening tag and its matching `</Tag>`; empty for `<Tag />`. */
function elementBody(source: string, tag: string, opening: { text: string; index: number }) {
	if (opening.text.endsWith("/>")) return "";
	const start = opening.index + opening.text.length;
	const pattern = new RegExp(`<(/?)${tag.replace(".", "\\.")}(?=[\\s/>])`, "g");
	pattern.lastIndex = start;
	let depth = 1;
	for (const match of source.matchAll(pattern)) {
		if (match.index < start) continue;
		depth += match[1] ? -1 : 1;
		if (depth === 0) return source.slice(start, match.index);
	}
	return source.slice(start);
}

function classTokens(tag: string): string[] {
	const match = /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/.exec(tag);
	const value = match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
	return value.match(/[^\s"'`,()[\]{}]+(?:\[[^\]]*\])?/g) ?? [];
}

/** Checks one file's source. `file` is only used in the findings. */
export function lintSource(file: string, source: string): LintFinding[] {
	const findings: LintFinding[] = [];
	const lineOf = (index: number) => source.slice(0, index).split("\n").length;
	const add = (index: number, rule: string, severity: LintFinding["severity"], message: string) =>
		findings.push({ file, line: lineOf(index), rule, severity, message });

	for (const match of source.matchAll(RAW_COLOR))
		add(
			match.index,
			"valar/semantic-color",
			"error",
			`\`${match[0]}\` 不是语义颜色 token，改用 bg-primary、text-muted-foreground 等`
		);
	for (const match of source.matchAll(ARBITRARY_PX))
		add(
			match.index,
			"valar/no-arbitrary-px",
			"warning",
			`\`${match[0]}\` 是像素任意值，改用对应档位以跟随全局 token`
		);

	for (const match of source.matchAll(MOTION_LITERAL))
		add(
			match.index,
			"valar/motion-token",
			"warning",
			`\`${match[0]}\` 写死了时长或曲线，改用 duration-fast／normal／slow、ease-enter／exit／standard 以跟随全局动效 token`
		);

	// Chart configs are often plain objects in .ts files, so this runs before the markup rules.
	if (/\bChartConfig\b|<Chart\.?Container\b/.test(source))
		for (const match of source.matchAll(CHART_LITERAL_COLOR))
			add(
				match.index,
				"valar/chart-color-token",
				"warning",
				"图表颜色写成了固定色值，改用 var(--chart-1)～var(--chart-5) 等主题 token"
			);

	const sorted = () => findings.sort((a, b) => a.line - b.line);
	if (!file.endsWith(".svelte")) return sorted();
	const tags = (names: string[]) =>
		names.flatMap((name) => openingTags(source, name).map((tag) => ({ name, ...tag })));
	const present = (names: string[]) => tags(names).length > 0;

	for (const tag of tags(BUTTON_LIKE)) {
		const layout = classTokens(tag.text).filter((token) => BUTTON_LAYOUT.test(token));
		if (layout.length)
			add(
				tag.index,
				"valar/button-size-via-prop",
				"error",
				`${tag.name} 的尺寸或圆角 \`${layout.join(" ")}\` 应改用 size 属性或写回组件参数`
			);
		// Attachment.Action defaults to an icon size, so it needs a name unless given a text size.
		const iconOnly = tag.name.startsWith("Attachment")
			? !/\ssize\s*=\s*["'](?!icon)/.test(tag.text)
			: /\ssize\s*=\s*["']icon/.test(tag.text);
		if (iconOnly && !HAS_LABEL.test(tag.text))
			add(tag.index, "valar/icon-button-label", "error", `只有图标的 ${tag.name} 需要 aria-label`);
	}
	for (const tag of tags(part("Attachment", "Trigger")))
		if (!HAS_LABEL.test(tag.text))
			add(
				tag.index,
				"valar/icon-button-label",
				"error",
				`${tag.name} 覆盖整张卡片且没有文字，需要 aria-label 说明点击后做什么`
			);
	for (const tag of openingTags(source, "button"))
		add(tag.index, "valar/use-button-component", "warning", "原生 <button> 改用 Button 组件");
	for (const [name, replacement] of Object.entries(NATIVE_FORM))
		for (const tag of openingTags(source, name))
			if (!/\stype\s*=\s*["']hidden["']/.test(tag.text))
				add(tag.index, "valar/use-form-component", "warning", `原生 <${name}> 改用 ${replacement}`);

	for (const tag of tags(LABELLED_CONTROLS)) {
		if (!/\s(?:id|aria-label|aria-labelledby)\s*=|\s\{id\}|\{\.\.\./.test(tag.text))
			add(
				tag.index,
				"valar/input-label",
				"warning",
				`${tag.name} 需要通过 id 与 Field.Label 关联，或提供 aria-label`
			);
		const invalid = classTokens(tag.text).filter(
			(token) => INVALID_CLASS.test(token) && !token.includes("aria-invalid:")
		);
		if (invalid.length)
			add(
				tag.index,
				"valar/invalid-via-aria",
				"warning",
				`${tag.name} 的错误样式 \`${invalid.join(" ")}\` 改用 aria-invalid="true"，组件已按它显示错误状态`
			);
	}
	// Slider thumbs are spans, which `<label for>` cannot name.
	for (const tag of openingTags(source, "Slider"))
		if (!/\s(?:aria-label|aria-labelledby|thumbLabels)\s*=|\{\.\.\./.test(tag.text))
			add(
				tag.index,
				"valar/input-label",
				"warning",
				"Slider 需要 aria-label、aria-labelledby 或 thumbLabels；Label 的 for 无法关联滑块"
			);

	for (const ns of ["Dialog", "AlertDialog", "Sheet", "Drawer"]) {
		const contents = tags(part(ns, "Content"));
		if (!contents.length) continue;
		if (!present(part(ns, "Title")))
			for (const tag of contents.filter((tag) => !HAS_LABEL.test(tag.text)))
				add(
					tag.index,
					"valar/overlay-title",
					"error",
					`${tag.name} 需要 ${ns}.Title（可加 class="sr-only" 隐藏）作为读屏器读出的名称`
				);
		if (ns === "AlertDialog" && !present(part(ns, "Cancel")))
			add(
				contents[0]!.index,
				"valar/alert-dialog-cancel",
				"warning",
				"AlertDialog 需要 AlertDialog.Cancel：点击遮罩不会关闭，用户必须有取消的出路"
			);
	}
	for (const tag of tags(BUTTON_TRIGGERS)) {
		const body = elementBody(source, tag.name, tag);
		if (/<(?:Button|button|a)(?=[\s/>])/.test(body) && !/\{#snippet child\b/.test(body))
			add(
				tag.index,
				"valar/trigger-child-snippet",
				"error",
				`${tag.name} 本身就是 <button>，里面再放按钮或链接会嵌套交互元素；改用 {#snippet child({ props })} 把 props 传给 Button`
			);
	}
	for (const tag of tags(part("Tooltip", "Content")))
		if (
			/<(?:Button|button|a|Input|input|Select\.Trigger)(?=[\s/>])/.test(
				elementBody(source, tag.name, tag)
			)
		)
			add(
				tag.index,
				"valar/tooltip-no-interactive",
				"warning",
				"Tooltip 内容无法聚焦和点击，可操作的内容改用 Popover"
			);
	for (const tag of tags(["img", ...part("Avatar", "Image")]))
		if (!/\salt\s*=|\s\{alt\}|\{\.\.\./.test(tag.text))
			add(tag.index, "valar/image-alt", "error", `${tag.name} 需要 alt；纯装饰的图片写 alt=""`);
	return sorted();
}

const LINT_EXTENSIONS = new Set([".svelte", ".ts", ".js", ".html"]);

/** Lints every source file under `paths`, skipping installed components and dependencies. */
export async function lintPaths(paths: string[], skipDirs: string[]): Promise<LintFinding[]> {
	const skipped = (file: string) =>
		file.includes(`${path.sep}node_modules${path.sep}`) ||
		skipDirs.some((dir) => file === dir || file.startsWith(dir + path.sep));
	const files: string[] = [];
	async function collect(target: string) {
		if (skipped(target) || !existsSync(target)) return;
		const stat = await fs.stat(target);
		if (stat.isDirectory()) {
			for (const entry of await fs.readdir(target)) {
				if (entry.startsWith(".") || entry === "node_modules") continue;
				await collect(path.join(target, entry));
			}
		} else if (LINT_EXTENSIONS.has(path.extname(target))) files.push(target);
	}
	for (const target of paths) await collect(path.resolve(target));
	const findings: LintFinding[] = [];
	for (const file of files.sort())
		findings.push(...lintSource(file, await fs.readFile(file, "utf8")));
	return findings;
}
