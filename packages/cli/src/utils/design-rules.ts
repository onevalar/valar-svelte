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
const BUTTON_LAYOUT = /^(?:[\w-]+:)*-?(?:min-h|h|px|py|size|rounded)(?:-|$)/;

/** Returns the source of each `<Tag ...>` opening tag, skipping `>` inside quotes and `{}`. */
function openingTags(source: string, tag: string): { text: string; index: number }[] {
	const result: { text: string; index: number }[] = [];
	const pattern = new RegExp(`<${tag}(?=[\\s/>])`, "g");
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

	if (!file.endsWith(".svelte")) return findings;
	for (const tag of openingTags(source, "Button")) {
		const layout = classTokens(tag.text).filter((token) => BUTTON_LAYOUT.test(token));
		if (layout.length)
			add(
				tag.index,
				"valar/button-size-via-prop",
				"error",
				`Button 的尺寸或圆角 \`${layout.join(" ")}\` 应改用 size 属性或写回组件参数`
			);
		if (
			/\ssize\s*=\s*["']icon/.test(tag.text) &&
			!/\saria-label(?:ledby)?\s*=|\{\.\.\./.test(tag.text)
		)
			add(tag.index, "valar/icon-button-label", "error", "只有图标的 Button 需要 aria-label");
	}
	for (const tag of openingTags(source, "button"))
		add(tag.index, "valar/use-button-component", "warning", "原生 <button> 改用 Button 组件");
	for (const name of ["Input", "Textarea"])
		for (const tag of openingTags(source, name))
			if (!/\s(?:id|aria-label|aria-labelledby)\s*=|\s\{id\}|\{\.\.\./.test(tag.text))
				add(
					tag.index,
					"valar/input-label",
					"warning",
					`${name} 需要通过 id 与 Field.Label 关联，或提供 aria-label`
				);
	return findings;
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
