import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import ts from "typescript";
import { registryItemSchema, type CssSchema, type RegistryItem } from "@valar/svelte-cli/schema";
import {
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";
import { buttonOverrideClasses } from "../src/lib/features/workbench/button-tuning.js";
import { COMPONENT_INVENTORY } from "../src/lib/features/workbench/coverage.js";
import {
	dialogOverrideClasses,
	parseDialogSource,
} from "../src/lib/features/workbench/dialog-tuning.js";
import { buildWorkbenchRegistry } from "../src/lib/features/workbench/export.js";
import {
	COMPONENTS,
	PARAMETERS,
	defaultPreset,
	defaults,
	parseWorkbenchPreset,
	presetSchema,
} from "../src/lib/features/workbench/model.js";
import {
	applyStyleOverrides,
	styleOverridePayloadSchema,
} from "../src/lib/features/workbench/style-overrides.js";
import { createWorkbenchCss } from "../src/lib/features/workbench/styles.js";

function originals(): RegistryItem[] {
	return COMPONENTS.map(({ id }) =>
		registryItemSchema.parse(
			JSON.parse(readFileSync(resolve(`static/registry/styles/vega/${id}.json`), "utf8"))
		)
	);
}
function source(registry: RegistryItem, target: string): string {
	return registry.files!.find((file) => file.target === target)!.content;
}
function declarations(css: string, selector: string): Record<string, string> {
	const result: Record<string, string> = {};
	postcss.parse(css).walkRules((rule) => {
		if (rule.selector === selector)
			rule.walkDecls((decl) => {
				result[decl.prop] = decl.value;
			});
	});
	return result;
}
function serializeCss(css: CssSchema): string {
	return Object.entries(css)
		.map(([key, value]) =>
			typeof value === "string" ? `${key}: ${value};` : `${key} { ${serializeCss(value)} }`
		)
		.join("\n");
}
function cssLeaves(css: string): string[] {
	const result: string[] = [];
	postcss.parse(css).walkDecls((decl) => {
		const path: string[] = [];
		let parent = decl.parent;
		while (parent && parent.type !== "root") {
			if (parent.type === "rule") path.unshift(parent.selector);
			if (parent.type === "atrule") path.unshift(`@${parent.name} ${parent.params}`);
			parent = parent.parent;
		}
		result.push(
			`${path.join(" > ")} | ${decl.prop}: ${decl.value}${decl.important ? " !important" : ""}`
		);
	});
	return result.sort();
}

/** Execute the installed source's real prop defaults, not a reimplementation of them.
 * Svelte compilation is checked separately; this isolates the exported prop contract
 * from DOM positioning/timing (left to the browser integration suite). */
function evaluateProps(source: string, props: Record<string, unknown>, expression: string) {
	const script = source
		.match(/<script[^>]*>([\s\S]*?)<\/script>/)![1]
		.replace(/^\s*import[\s\S]*?;\s*/gm, "");
	const js = ts
		.transpileModule(script, {
			compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
		})
		.outputText.replace(/\bexport\s*\{\s*\};?/g, "");
	return new Function("$props", "$bindable", "$derived", `${js}\nreturn (${expression});`)(
		() => props,
		(value: unknown) => value,
		(value: unknown) => value
	);
}

describe("workbench public preset contract", () => {
	it("has complete unique descriptors and independent mutable clones of immutable defaults", () => {
		expect([...COMPONENT_INVENTORY].sort()).toEqual(
			readdirSync(resolve("src/lib/registry/ui"), { withFileTypes: true })
				.filter((item) => item.isDirectory())
				.map((item) => item.name)
				.sort()
		);
		expect(COMPONENTS.every(({ id }) => COMPONENT_INVENTORY.some((name) => name === id))).toBe(
			true
		);
		expect(new Set(PARAMETERS.map((p) => p.key)).size).toBe(PARAMETERS.length);
		expect(Object.keys(defaults)).toHaveLength(PARAMETERS.length);
		expect(presetSchema.parse(defaultPreset)).toEqual(defaultPreset);
		const first = structuredClone(defaultPreset);
		first.values["button.height"] = 64;
		const second = parseWorkbenchPreset(defaultPreset);
		expect(second.values["button.height"]).toBe(40);
		expect(defaults["button.height"]).toBe(40);
		second.values["button.height"] = 48;
		expect(defaultPreset.values["button.height"]).toBe(40);
	});

	it("rejects unknown/missing keys, incorrect types, versions, malformed JSON and unsafe values", () => {
		for (const input of [
			null,
			[],
			{},
			{ ...defaultPreset, version: 2 },
			{ ...defaultPreset, extra: true },
			{ ...defaultPreset, values: {} },
			{ ...defaultPreset, name: "<script>" },
			{ ...defaultPreset, name: "" },
		]) {
			expect(presetSchema.safeParse(input).success).toBe(false);
		}
		for (const [key, value] of [
			["global.radius", "12"],
			["button.height", Infinity],
			["button.height", NaN],
			["dialog.closeOnEscape", "false"],
			["tooltip.side", "center"],
			["accordion.type", "all"],
			["dialog.easing", "cubic-bezier(0,0,0,1)"],
			["button.bg", "red; } body { display:none"],
			["unknown", 1],
		] as const) {
			expect(
				presetSchema.safeParse({ ...defaultPreset, values: { ...defaults, [key]: value } }).success,
				key
			).toBe(false);
		}
		for (const parameter of PARAMETERS.filter((p) => p.type === "number")) {
			for (const value of [parameter.min! - 1, parameter.max! + 1]) {
				expect(
					presetSchema.safeParse({
						...defaultPreset,
						values: { ...defaults, [parameter.key]: value },
					}).success,
					parameter.key
				).toBe(false);
			}
		}
		expect(() => parseWorkbenchPreset("{oops")).toThrow();
		expect(() => parseWorkbenchPreset('{"__proto__":{"polluted":true}}')).toThrow();
		expect({}).not.toHaveProperty("polluted");
	});

	it("accepts numeric picker color formats but rejects CSS injection and malformed colors", () => {
		for (const value of [
			"#abc",
			"#abcd",
			"#123456",
			"#12345678",
			"rgb(12, 24, 36)",
			"rgba(12, 24, 36, 0.5)",
			"rgb(10% 20% 30% / 80%)",
			"hsl(240 60% 50%)",
			"hsla(240deg, 60%, 50%, .5)",
			"oklch(0.65 0.2 250 / .8)",
			"oklch(65% 0.2 250deg)",
			"color(display-p3 0.2 0.3 0.4 / 1)",
		]) {
			expect(
				presetSchema.safeParse({ ...defaultPreset, values: { ...defaults, "button.bg": value } })
					.success,
				value
			).toBe(true);
		}
		for (const value of [
			"#zzzzzz",
			"rgb(1 2)",
			"rgb(1,2,3,4,5)",
			"hsl(1 2 3)",
			"var(--primary)",
			"url(https://example.com)",
			"rgb(calc(1 + 1) 0 0)",
			"color(display-p3 1 2)",
			"oklch(none 0 0)",
			"#fff</style><script>",
			"rgb(1 2 3); color: red",
			"rgb(999999999999 0 0)",
		]) {
			expect(
				presetSchema.safeParse({ ...defaultPreset, values: { ...defaults, "button.bg": value } })
					.success,
				value
			).toBe(false);
		}
	});

	it("round-trips raw JSON and the downloaded registry metadata without sharing state", () => {
		const preset = structuredClone(defaultPreset);
		preset.name = "设计方案 B";
		preset.values["dialog.width"] = 640;
		expect(parseWorkbenchPreset(JSON.stringify(preset))).toEqual(preset);
		const exported = buildWorkbenchRegistry(preset, originals());
		expect(exported.meta?.workbenchPreset).toEqual(preset);
		expect(parseWorkbenchPreset(JSON.stringify(exported))).toEqual(preset);
		preset.values["dialog.width"] = 480;
		expect(exported.meta?.workbenchPreset.values["dialog.width"]).toBe(640);
	});
});

describe("shared preview / installed CSS", () => {
	it("resolves explicit global inheritance and independent per-component overrides", () => {
		const preset = structuredClone(defaultPreset);
		Object.assign(preset.values, {
			"global.radius": 22,
			"global.motionDuration": 350,
			"global.easing": "linear",
			"global.primary": "#123456",
			"global.fontSize": 18,
		});
		let css = createWorkbenchCss(preset);
		expect(declarations(css, '[data-slot="button"]')).toMatchObject({
			"border-radius": "22px",
			"font-size": "18px",
			transition: "background-color 350ms linear, scale 350ms linear",
		});
		expect(
			declarations(css, '[data-slot="button"][data-variant="default"]')["background-color"]
		).toBe("#123456");
		for (const c of ["dialog-content", "tooltip-content", "accordion-item"]) {
			expect(declarations(css, `[data-slot="${c}"]`)["border-radius"]).toBe("22px");
		}
		expect(declarations(css, '[data-slot="tooltip-content"]')["font-size"]).toBe("12px");
		Object.assign(preset.values, {
			"button.inheritRadius": false,
			"button.radius": 4,
			"button.inheritColors": false,
			"button.bg": "rgb(24 48 96)",
			"button.text": "#abcdef",
			"button.inheritMotion": false,
			"button.duration": 90,
			"button.easing": "ease-in",
			"tooltip.inheritFontSize": true,
			"dialog.inheritRadius": false,
			"dialog.radius": 16,
			"dialog.inheritColors": false,
			"dialog.background": "#fedcba",
			"tooltip.inheritColors": false,
			"tooltip.bg": "#aabbcc",
			"tooltip.text": "#112233",
		});
		css = createWorkbenchCss(preset);
		expect(declarations(css, '[data-slot="button"]')).toMatchObject({
			"border-radius": "4px",
			transition: "background-color 90ms ease-in, scale 90ms ease-in",
		});
		expect(declarations(css, '[data-slot="button"][data-variant="default"]')).toMatchObject({
			"background-color": "rgb(24 48 96)",
			color: "#abcdef",
		});
		expect(declarations(css, '[data-slot="dialog-content"]')).toMatchObject({
			"border-radius": "16px",
			"background-color": "#fedcba",
		});
		expect(declarations(css, '[data-slot="tooltip-content"]')).toMatchObject({
			"font-size": "18px",
			"background-color": "#aabbcc",
			color: "#112233",
		});
		expect(
			declarations(css, '[data-slot="tooltip-content"] > div[data-side]')["background-color"]
		).toBe("#aabbcc");
	});

	it("uses actual Bits states, full animation shorthands, safe centering and reduced motion", () => {
		const preset = structuredClone(defaultPreset);
		Object.assign(preset.values, {
			"dialog.inheritMotion": false,
			"dialog.enterDuration": 420,
			"dialog.exitDuration": 120,
			"dialog.easing": "ease-in-out",
		});
		const css = createWorkbenchCss(preset);
		expect(declarations(css, '[data-slot="dialog-content"][data-state="open"]').animation).toBe(
			"wb-panel-in 420ms ease-in-out both"
		);
		expect(declarations(css, '[data-slot="dialog-content"][data-state="closed"]').animation).toBe(
			"wb-panel-out 120ms ease-in-out both"
		);
		expect(css).toContain('[data-state="delayed-open"]');
		expect(css).toContain('[data-state="instant-open"]');
		expect(css).toContain("height: var(--bits-accordion-content-height)");
		expect(css).toContain("prefers-reduced-motion: reduce");
		expect(css).toContain("scale: 1 !important");
		expect(css).not.toMatch(/(?:^|[;{])\s*translate\s*:/);
		expect(css).not.toContain("@layer");
	});
});

describe("installable native component bundle", () => {
	it("is a valid registry, keeps original sources and dependencies, and embeds the exact preview CSS", () => {
		const items = originals();
		items[0].dependencies = ["example-package", "example-package"];
		items[0].registryDependencies = ["utils", "dialog", "https://example.com/button.json"];
		items[0].css = { ".existing-rule": { color: "red" } };
		const before = JSON.stringify(items);
		const bundle = buildWorkbenchRegistry(defaultPreset, items);
		expect(registryItemSchema.safeParse(JSON.parse(JSON.stringify(bundle))).success).toBe(true);
		expect(bundle.type).toBe("registry:ui");
		expect(bundle.files).toHaveLength(items.reduce((count, item) => count + item.files!.length, 0));
		expect(
			bundle.files!.every(
				(file) =>
					file.type === "registry:ui" && /^(button|dialog|tooltip|accordion)\//.test(file.target)
			)
		).toBe(true);
		expect(bundle.registryDependencies).toEqual(["utils", "https://example.com/button.json"]);
		expect(bundle.dependencies).toEqual(["example-package"]);
		expect(bundle.devDependencies).toEqual([
			...new Set(items.flatMap((item) => item.devDependencies ?? [])),
		]);
		expect(bundle.devDependencies?.some((d) => d.includes("dialkit"))).toBe(false);
		expect(source(bundle, "button/button.svelte")).toBe(source(items[0], "button/button.svelte"));
		// Design rules ship with the exported component too.
		expect(source(bundle, "button/RULES.md")).toContain("Button 设计规范");
		expect(JSON.stringify(items)).toBe(before);
		const css = { ...bundle.css };
		delete css[".existing-rule"];
		expect(cssLeaves(serializeCss(css))).toEqual(cssLeaves(createWorkbenchCss(defaultPreset)));
		for (const file of bundle.files!.filter((file) => file.target.endsWith(".svelte"))) {
			expect(
				() => compile(file.content, { filename: file.target, generate: "client" }),
				file.target
			).not.toThrow();
		}
	});

	it("installs behavior defaults and preserves explicit caller overrides and bind/value contracts", () => {
		const preset = structuredClone(defaultPreset);
		Object.assign(preset.values, {
			"dialog.closeOnEscape": false,
			"dialog.closeOnOutside": false,
			"dialog.showCloseButton": false,
			"tooltip.delayDuration": 650,
			"tooltip.side": "right",
			"tooltip.sideOffset": 14,
			"accordion.type": "multiple",
			"accordion.disabled": true,
		});
		const bundle = buildWorkbenchRegistry(preset, originals());
		const dialog = source(bundle, "dialog/dialog-content.svelte");
		expect(
			evaluateProps(dialog, {}, "{showCloseButton, escapeKeydownBehavior, interactOutsideBehavior}")
		).toEqual({
			showCloseButton: false,
			escapeKeydownBehavior: "ignore",
			interactOutsideBehavior: "ignore",
		});
		expect(
			evaluateProps(
				dialog,
				{ showCloseButton: true, escapeKeydownBehavior: "close", interactOutsideBehavior: "close" },
				"{showCloseButton, escapeKeydownBehavior, interactOutsideBehavior}"
			)
		).toEqual({
			showCloseButton: true,
			escapeKeydownBehavior: "close",
			interactOutsideBehavior: "close",
		});
		const content = dialog.slice(dialog.indexOf("<DialogPrimitive.Content"));
		expect(content.indexOf("{escapeKeydownBehavior}")).toBeLessThan(
			content.indexOf("{...restProps}")
		);
		expect(content.indexOf("{interactOutsideBehavior}")).toBeLessThan(
			content.indexOf("{...restProps}")
		);
		expect(dialog).toContain("{#if showCloseButton}");
		const provider = source(bundle, "tooltip/tooltip-provider.svelte");
		expect(evaluateProps(provider, {}, "delayDuration")).toBe(650);
		expect(evaluateProps(provider, { delayDuration: 0 }, "delayDuration")).toBe(0);
		const tooltip = source(bundle, "tooltip/tooltip-content.svelte");
		expect(evaluateProps(tooltip, {}, "{side, sideOffset}")).toEqual({
			side: "right",
			sideOffset: 14,
		});
		expect(evaluateProps(tooltip, { side: "bottom", sideOffset: 0 }, "{side, sideOffset}")).toEqual(
			{ side: "bottom", sideOffset: 0 }
		);
		expect(tooltip).toContain("\t\t{sideOffset}\n\t\t{side}");
		const accordion = source(bundle, "accordion/accordion.svelte");
		expect(evaluateProps(accordion, {}, "rootProps")).toEqual({ type: "multiple", disabled: true });
		const onValueChange = () => {};
		expect(
			evaluateProps(
				accordion,
				{ type: "single", disabled: false, value: "one", onValueChange },
				"{value, rootProps}"
			)
		).toEqual({ value: "one", rootProps: { type: "single", disabled: false, onValueChange } });
		expect(evaluateProps(accordion, { type: undefined, disabled: undefined }, "rootProps")).toEqual(
			{ type: "multiple", disabled: true }
		);
		expect(accordion).toContain("bind:value={value as never}");
		expect(accordion).toContain("{...rootProps}");
	});

	it.each(["single", "multiple"])(
		"preserves discriminated Accordion prop types with %s defaults",
		(type) => {
			const preset = structuredClone(defaultPreset);
			preset.values["accordion.type"] = type;
			const accordion = source(
				buildWorkbenchRegistry(preset, originals()),
				"accordion/accordion.svelte"
			);
			const declaration = accordion.match(/type WorkbenchAccordionProps =[\s\S]*?;/)![0];
			const virtualPath = resolve("tests/workbench-props-contract.ts");
			const code = `import { Accordion as AccordionPrimitive } from "bits-ui";
${declaration}
const omitted: WorkbenchAccordionProps = { value: ${type === "single" ? '"one"' : '["one"]'} };
const single: WorkbenchAccordionProps = { type: "single", value: "one", onValueChange: (value: string) => {} };
const multiple: WorkbenchAccordionProps = { type: "multiple", value: ["one"], onValueChange: (value: string[]) => {} };
// @ts-expect-error single mode cannot receive an array
const wrongSingle: WorkbenchAccordionProps = { type: "single", value: ["one"] };
// @ts-expect-error multiple mode cannot receive a string
const wrongMultiple: WorkbenchAccordionProps = { type: "multiple", value: "one" };
// @ts-expect-error omitted type must match the preset's default branch
const wrongDefault: WorkbenchAccordionProps = { value: ${type === "single" ? '["one"]' : '"one"'} };
`;
			const options: ts.CompilerOptions = {
				target: ts.ScriptTarget.ES2022,
				module: ts.ModuleKind.NodeNext,
				moduleResolution: ts.ModuleResolutionKind.NodeNext,
				strict: true,
				skipLibCheck: true,
				noEmit: true,
				types: [],
			};
			const host = ts.createCompilerHost(options);
			const read = host.readFile.bind(host);
			host.readFile = (path) => (path === virtualPath ? code : read(path));
			const program = ts.createProgram([virtualPath], options, host);
			const diagnostics = ts
				.getPreEmitDiagnostics(program)
				.filter((d) => d.file?.fileName === virtualPath);
			expect(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))).toEqual(
				[]
			);
		},
		15000
	);

	it("fails clearly on missing components, source drift, path traversal and conflicting files", () => {
		expect(() => buildWorkbenchRegistry(defaultPreset, originals().slice(1))).toThrow("button");
		const drifted = originals();
		drifted[1].files!.find((file) => file.target === "dialog/dialog-content.svelte")!.content =
			"<div />";
		expect(() => buildWorkbenchRegistry(defaultPreset, drifted)).toThrow("源码锚点");
		const unsafe = originals();
		unsafe[0].files![0].target = "../outside.svelte";
		expect(() => buildWorkbenchRegistry(defaultPreset, unsafe)).toThrow("不安全");
		const conflict = originals();
		conflict[0].files!.push({ ...conflict[0].files![0], content: "<button />" });
		expect(() => buildWorkbenchRegistry(defaultPreset, conflict)).toThrow("冲突");
	});
});

describe("Button write-back into Valar style overrides", () => {
	const upstream = readFileSync(resolve("src/lib/registry/styles/style-nova.css"), "utf8");
	const buttonSource = readFileSync(resolve("src/lib/registry/ui/button/button.svelte"), "utf8");
	const sizeClasses = (css: string, size: string) =>
		injectStyleClasses(buttonSource, mergeStyleMaps(parseStyleCss(upstream), parseStyleCss(css)))
			.split("size: {")[1]!
			.match(new RegExp(`\\n\\t+"?${size}"?: "([^"]*)"`))![1]!
			.split(" ");

	it("replaces conflicting utilities in the installed source and keeps earlier write-backs", () => {
		const empty = readFileSync(resolve("src/lib/registry/styles/valar/style-nova.css"), "utf8");
		const first = applyStyleOverrides(
			empty,
			styleOverridePayloadSchema.parse({
				style: "nova",
				classes: buttonOverrideClasses({ "default.height": 44, "default.paddingX": 16 }),
			})
		);
		// A later write for another size must not drop the first one.
		const second = applyStyleOverrides(
			first,
			styleOverridePayloadSchema.parse({
				style: "nova",
				classes: buttonOverrideClasses({ "lg.height": 50, radius: "xl" }),
			})
		);
		const defaults = sizeClasses(second, "default");
		expect(defaults).toEqual(expect.arrayContaining(["h-11", "px-4", "rounded-xl", "gap-1.5"]));
		expect(defaults).not.toContain("h-8");
		expect(defaults).not.toContain("px-2.5");
		// Icon-side padding from upstream stays.
		expect(defaults).toContain("has-data-[icon=inline-start]:pl-2");
		expect(sizeClasses(second, "icon")).toEqual(expect.arrayContaining(["size-11"]));
		expect(sizeClasses(second, "lg")).toContain("h-12.5");
		expect(sizeClasses(second, "lg")).not.toContain("h-9");
		// Untouched sizes keep upstream values.
		expect(sizeClasses(second, "sm")).toContain("h-7");
		// An empty override file leaves the installed source identical to upstream.
		expect(injectStyleClasses(buttonSource, mergeStyleMaps(parseStyleCss(upstream), {}))).toBe(
			injectStyleClasses(buttonSource, parseStyleCss(upstream))
		);
	});

	it("rejects anything other than Button size and radius-level utilities", () => {
		for (const classes of [
			{ "cn-button-size-default": "h-11 bg-red-500" },
			{ "cn-button-size-default": "h-[44px]" },
			{ "cn-card": "h-11" },
			{ "cn-button": "rounded-xl } .x { color: red" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		expect(styleOverridePayloadSchema.safeParse({ style: "../x", classes: {} }).success).toBe(
			false
		);
	});
});

describe("Dialog write-back into Valar style overrides", () => {
	const registry = (style: string) =>
		JSON.parse(readFileSync(resolve(`static/registry/styles/${style}/dialog.json`), "utf8"));
	const injected = (style: string, css: string, file: string) => {
		const map = mergeStyleMaps(
			parseStyleCss(readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")),
			parseStyleCss(css)
		);
		const source = readFileSync(resolve(`src/lib/registry/ui/dialog/${file}`), "utf8");
		return injectStyleClasses(source, map)
			.match(/cn\(\s*"([^"]*)"/)![1]!
			.split(" ");
	};
	const write = (style: string, overrides: Parameters<typeof dialogOverrideClasses>[0]) => {
		const { context } = parseDialogSource(registry(style).files);
		return applyStyleOverrides(
			readFileSync(resolve(`src/lib/registry/styles/valar/style-${style}.css`), "utf8"),
			styleOverridePayloadSchema.parse({
				style,
				classes: dialogOverrideClasses(overrides, context),
			})
		);
	};

	it("reads each style's own baseline from the installed source", () => {
		const nova = parseDialogSource(registry("nova").files);
		expect(nova.values).toMatchObject({ padding: 16, gap: 16, overlay: 10, radius: "xl" });
		expect(nova.context).toEqual({ footerBleed: true, footerRounded: true });
		const vega = parseDialogSource(registry("vega").files);
		expect(vega.values).toMatchObject({ padding: 24, gap: 24, overlay: 10 });
		expect(vega.context).toEqual({ footerBleed: false, footerRounded: false });
		expect(parseDialogSource(registry("maia").files).values.overlay).toBe(80);
	});

	it("keeps the bleeding footer aligned with the new padding and swaps motion tiers", () => {
		const css = write("nova", { padding: 24, duration: "slow", zoom: "90", overlay: 40 });
		const content = injected("nova", css, "dialog-content.svelte");
		expect(content).toEqual(expect.arrayContaining(["p-6", "gap-4", "duration-slow"]));
		expect(content).toEqual(
			expect.arrayContaining(["data-open:zoom-in-90", "data-closed:zoom-out-90"])
		);
		expect(content).not.toContain("p-4");
		expect(content).not.toContain("data-open:zoom-in-95");
		const footer = injected("nova", css, "dialog-footer.svelte");
		expect(footer).toEqual(expect.arrayContaining(["-mx-6", "-mb-6", "p-6"]));
		expect(footer).not.toContain("-mx-4");
		const overlay = injected("nova", css, "dialog-overlay.svelte");
		expect(overlay).toEqual(expect.arrayContaining(["bg-black/40", "duration-slow"]));
		expect(overlay).not.toContain("bg-black/10");
		expect(overlay).not.toContain("duration-100");
		// Vega's footer does not bleed, so padding must not add negative margins there.
		expect(injected("vega", write("vega", { padding: 20 }), "dialog-footer.svelte")).not.toContain(
			"-mx-5"
		);
	});

	it("rejects colors, arbitrary values and utilities outside each Dialog part", () => {
		for (const classes of [
			{ "cn-dialog-content": "p-6 bg-red-500" },
			{ "cn-dialog-content": "duration-[400ms]" },
			{ "cn-dialog-overlay": "bg-black/45" },
			{ "cn-dialog-overlay": "bg-white/40" },
			{ "cn-dialog-footer": "duration-slow" },
			{ "cn-dialog-title": "p-4" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});
