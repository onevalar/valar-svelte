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

	it("flags hard-coded motion but not the global tiers", () => {
		const source = [
			'<div class="transition duration-fast ease-enter data-closed:duration-normal ease-linear"></div>',
			'<div class="duration-250 hover:ease-[cubic-bezier(0.2,0,0,1)] ease-in-out"></div>',
		].join("\n");
		expect(rules(source)).toEqual([
			"2:valar/motion-token",
			"2:valar/motion-token",
			"2:valar/motion-token",
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

	it("extends size and label checks to components built on Button", () => {
		const source = [
			'<AlertDialog.Action variant="destructive" class="h-11">删除</AlertDialog.Action>',
			"<Attachment.Action><X /></Attachment.Action>",
			'<Attachment.Action size="sm">重试</Attachment.Action>',
			'<Attachment.Action aria-label="移除 a.pdf"><X /></Attachment.Action>',
			'<InputGroup.Button size="icon-xs"><X /></InputGroup.Button>',
			'<InputGroup.Button size="xs">搜索</InputGroup.Button>',
			"<Attachment.Trigger />",
		].join("\n");
		expect(rules(source)).toEqual([
			"1:valar/button-size-via-prop",
			"2:valar/icon-button-label",
			"5:valar/icon-button-label",
			"7:valar/icon-button-label",
		]);
	});

	it("checks form control labels, error styling and native form elements", () => {
		const source = [
			'<Checkbox id="terms" /><Checkbox />',
			'<Slider id="volume" /><Slider aria-label="音量" /><SliderField label="音量" />',
			'<NativeSelect.Root><NativeSelect.Option value="a">A</NativeSelect.Option></NativeSelect.Root>',
			'<Select.Trigger id="s" class="w-full aria-invalid:border-destructive">',
			'<Input id="email" class="border-destructive" />',
			'<input type="hidden" name="token" /><input type="checkbox" />',
			"<textarea></textarea><select></select>",
		].join("\n");
		expect(rules(source)).toEqual([
			"1:valar/input-label",
			"2:valar/input-label",
			"3:valar/input-label",
			"5:valar/invalid-via-aria",
			"6:valar/use-form-component",
			"7:valar/use-form-component",
			"7:valar/use-form-component",
		]);
	});

	it("checks overlay titles, alert dialog cancel and triggers", () => {
		const titled = [
			"<Dialog.Root>",
			"<Dialog.Trigger>",
			"{#snippet child({ props })}<Button {...props}>打开</Button>{/snippet}",
			"</Dialog.Trigger>",
			"<Dialog.Content><Dialog.Title>编辑</Dialog.Title></Dialog.Content>",
			"</Dialog.Root>",
		].join("\n");
		expect(rules(titled)).toEqual([]);

		const source = [
			"<Dialog.Content>",
			"<AlertDialog.Title>只有警告框的标题</AlertDialog.Title>",
			"</Dialog.Content>",
			'<AlertDialog.Content aria-label="删除"><AlertDialog.Action>删除</AlertDialog.Action></AlertDialog.Content>',
			"<SheetContent>",
			"<DialogTrigger><a href='/x'>链接</a></DialogTrigger>",
			"<Popover.Trigger>",
			"  <Button>嵌套</Button>",
			"</Popover.Trigger>",
			'<ContextMenu.Trigger><Button>右键区域</Button></ContextMenu.Trigger><Tooltip.Trigger class="x">文字</Tooltip.Trigger>',
		].join("\n");
		expect(rules(source)).toEqual([
			"1:valar/overlay-title",
			"4:valar/alert-dialog-cancel",
			"5:valar/overlay-title",
			"6:valar/trigger-child-snippet",
			"7:valar/trigger-child-snippet",
		]);
	});

	it("checks tooltip content, image alt text and chart colors", () => {
		const source = [
			"<Tooltip.Content><p>保存草稿</p></Tooltip.Content>",
			"<Tooltip.Content>",
			"  <a href='/help'>帮助</a>",
			"</Tooltip.Content>",
			'<img src="/a.png" /><img src="/b.png" alt="" /><Avatar.Image src={url} {alt} />',
			"<AvatarImage src={url} />",
		].join("\n");
		expect(rules(source)).toEqual([
			"2:valar/tooltip-no-interactive",
			"5:valar/image-alt",
			"6:valar/image-alt",
		]);

		const chart = [
			"const config = {",
			'  desktop: { label: "桌面", color: "var(--chart-1)" },',
			'  mobile: { label: "移动", color: "#60a5fa" },',
			"} satisfies ChartConfig;",
		].join("\n");
		expect(rules(chart, "chart.ts")).toEqual(["3:valar/chart-color-token"]);
		expect(rules('const brand = { color: "#60a5fa" };', "brand.ts")).toEqual([]);
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
