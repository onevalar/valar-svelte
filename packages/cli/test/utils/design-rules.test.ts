import os from "node:os";
import path from "node:path";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
	RULES_END,
	RULES_START,
	lintPaths,
	lintSource,
	updateAgentsRules,
} from "../../src/utils/design-rules.js";

const rules = (source: string, file = "page.svelte") =>
	lintSource(file, source).map((f) => `${f.line}:${f.rule}`);

describe("lintSource", () => {
	it("flags raw colors and arbitrary pixels but not semantic tokens", () => {
		const source = [
			'<div class="bg-primary text-muted-foreground border-border hover:bg-primary/80"></div>',
			'<div class="hover:bg-blue-500 text-white/80 border-[#ff0000]"></div>',
			'<div class="h-[37px] rounded-lg bg-background-blue-500x"></div>',
		].join("\n");
		expect(rules(source)).toEqual([
			"2:valar/semantic-color",
			"2:valar/semantic-color",
			"2:valar/semantic-color",
			"3:valar/no-arbitrary-px",
		]);
	});

	it("checks Button sizing, icon labels, native buttons and input labels", () => {
		const source = [
			'<Button size="sm" class="w-full">保存</Button>',
			'<Button class={cn("h-11 px-4", other)}>大</Button>',
			'<Button size="icon" onclick={() => (a > b)}><X /></Button>',
			'<Button size="icon-sm" aria-label="关闭"><X /></Button>',
			"<button>原生</button>",
			'<Input placeholder="邮箱" />',
			'<Input id="email" />',
		].join("\n");
		expect(rules(source)).toEqual([
			"2:valar/button-size-via-prop",
			"3:valar/icon-button-label",
			"5:valar/use-button-component",
			"6:valar/input-label",
		]);
		// Markup rules only apply to Svelte components.
		expect(rules('const x = "<button>";', "x.ts")).toEqual([]);
	});
});

describe("project files", () => {
	let dir: string;
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("writes one managed AGENTS.md block from installed RULES.md and keeps user text", async () => {
		dir = mkdtempSync(path.join(os.tmpdir(), "valar-rules-"));
		const ui = path.join(dir, "src/lib/components/ui");
		mkdirSync(path.join(ui, "button"), { recursive: true });
		mkdirSync(path.join(ui, "card"), { recursive: true });
		writeFileSync(
			path.join(ui, "button/RULES.md"),
			"# Button 设计规范\n\n- 一个区域一个主按钮。\n"
		);
		writeFileSync(path.join(dir, "AGENTS.md"), "# 我的项目\n\n自己的说明。\n");
		await updateAgentsRules(ui, dir);
		await updateAgentsRules(ui, dir);
		const agents = readFileSync(path.join(dir, "AGENTS.md"), "utf8");
		expect(agents.startsWith("# 我的项目\n\n自己的说明。\n\n" + RULES_START)).toBe(true);
		expect(agents.split(RULES_START)).toHaveLength(2);
		expect(agents).toContain("### Button 设计规范");
		expect(agents).toContain("`src/lib/components/ui/button/RULES.md`");
		expect(agents).toContain("一个区域一个主按钮");
		expect(agents).not.toContain("card");
		expect(agents.trimEnd().endsWith(RULES_END)).toBe(true);

		// Installed component sources are skipped; app code is checked.
		writeFileSync(path.join(ui, "button/button.svelte"), '<button class="bg-red-500"></button>');
		mkdirSync(path.join(dir, "src/routes"), { recursive: true });
		writeFileSync(path.join(dir, "src/routes/+page.svelte"), '<p class="text-gray-500"></p>');
		const findings = await lintPaths([path.join(dir, "src")], [ui]);
		expect(findings.map((f) => [path.basename(f.file), f.rule])).toEqual([
			["+page.svelte", "valar/semantic-color"],
		]);
	});
});
