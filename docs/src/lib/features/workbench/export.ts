import {
	registryItemSchema,
	type CssSchema,
	type RegistryItem,
	type RegistryItemFile,
} from "@valar/svelte-cli/schema";
import postcss, { type Container } from "postcss";
import { COMPONENTS, presetSchema, type WorkbenchPreset } from "./model.js";
import { createWorkbenchCss } from "./styles.js";

function replaceOnce(source: string, anchor: string, replacement: string, file: string): string {
	const position = source.indexOf(anchor);
	if (position < 0 || source.indexOf(anchor, position + anchor.length) >= 0) {
		throw new Error(`无法导出 ${file}：上游源码锚点缺失或不唯一，请更新工作台适配。`);
	}
	return source.slice(0, position) + replacement + source.slice(position + anchor.length);
}

function applyBehaviorDefaults(file: RegistryItemFile, preset: WorkbenchPreset): RegistryItemFile {
	const v = preset.values;
	let source = file.content;
	const replace = (anchor: string, replacement: string) => {
		source = replaceOnce(source, anchor, replacement, file.target);
	};
	if (file.target === "dialog/dialog-content.svelte") {
		replace(
			"\t\tshowCloseButton = true,\n\t\t...restProps",
			`\t\tshowCloseButton = ${v["dialog.showCloseButton"]},\n\t\tescapeKeydownBehavior = "${v["dialog.closeOnEscape"] ? "close" : "ignore"}",\n\t\tinteractOutsideBehavior = "${v["dialog.closeOnOutside"] ? "close" : "ignore"}",\n\t\t...restProps`
		);
		replace(
			'\t\tdata-slot="dialog-content"',
			'\t\tdata-slot="dialog-content"\n\t\t{escapeKeydownBehavior}\n\t\t{interactOutsideBehavior}'
		);
	} else if (file.target === "tooltip/tooltip-provider.svelte") {
		replace(
			"delayDuration = styleDelay, ...restProps",
			`delayDuration = ${v["tooltip.delayDuration"]}, ...restProps`
		);
	} else if (file.target === "tooltip/tooltip-content.svelte") {
		replace(
			'\t\tsideOffset = 0,\n\t\tside = "top",',
			`\t\tsideOffset = ${v["tooltip.sideOffset"]},\n\t\tside = ${JSON.stringify(v["tooltip.side"])},`
		);
	} else if (file.target === "accordion/accordion.svelte") {
		const defaultType = v["accordion.type"];
		const alternateType = defaultType === "single" ? "multiple" : "single";
		// Only the selected default branch may omit type. The other branch retains Bits'
		// discriminated value/onValueChange types; a non-distributive Omit would lose them.
		replace(
			"\tlet {",
			`\ttype WorkbenchAccordionProps =\n\t\t| (Omit<Extract<AccordionPrimitive.RootProps, { type: "${defaultType}" }>, "type"> & { type?: "${defaultType}" })\n\t\t| Extract<AccordionPrimitive.RootProps, { type: "${alternateType}" }>;\n\n\tlet {`
		);
		replace(
			"\t\tclass: className,\n\t\t...restProps",
			`\t\tclass: className,\n\t\ttype = "${defaultType}",\n\t\tdisabled = ${v["accordion.disabled"]},\n\t\t...restProps`
		);
		replace(
			"\t}: AccordionPrimitive.RootProps = $props();",
			"\t}: WorkbenchAccordionProps = $props();\n\n\tconst rootProps = $derived({ ...restProps, type, disabled } as AccordionPrimitive.RootProps);"
		);
		replace("\t{...restProps}\n/>", "\t{...rootProps}\n/>");
	}
	return { ...file, content: source };
}

function mergeCss(target: CssSchema, source: CssSchema): CssSchema {
	for (const [key, value] of Object.entries(source)) {
		const previous = target[key];
		target[key] =
			typeof value === "string"
				? value
				: mergeCss(typeof previous === "object" ? previous : {}, value);
	}
	return target;
}

/** Lossless for the generated rules, keyframes, declarations and media queries. */
function cssRecord(container: Container): CssSchema {
	const result: CssSchema = {};
	for (const node of container.nodes ?? []) {
		if (node.type === "decl") {
			result[node.prop] = node.value + (node.important ? " !important" : "");
		} else if (node.type === "rule") {
			mergeCss(result, { [node.selector]: cssRecord(node) });
		} else if (node.type === "atrule") {
			const key = `@${node.name}${node.params ? ` ${node.params}` : ""}`;
			result[key] = node.nodes ? cssRecord(node) : "";
		}
	}
	return result;
}

function normalizeFile(file: RegistryItemFile, item: RegistryItem): RegistryItemFile {
	let target = file.target.replaceAll("\\", "/").replace(/^\.\//, "");
	if (item.type === "registry:ui") {
		target = target.replace(/^(?:\$UI\$\/|(?:src\/lib\/)?(?:registry|components)\/ui\/)/, "");
		if (!target.startsWith(`${item.name}/`)) target = `${item.name}/${target}`;
	}
	if (
		target.startsWith("/") ||
		target.includes(":") ||
		target.split("/").some((part) => part === ".." || part === "~" || part === "")
	) {
		throw new Error(`不安全的组件文件路径：${file.target}`);
	}
	return {
		...file,
		target,
		type: file.type === "registry:file" && item.type === "registry:ui" ? "registry:ui" : file.type,
	};
}

/** Bundle the existing native components; no editor/DialKit runtime is installed. */
export function buildWorkbenchRegistry(
	preset: WorkbenchPreset,
	items: RegistryItem[]
): RegistryItem {
	const validated = presetSchema.parse(preset);
	const originals = items.map((item) => registryItemSchema.parse(item));
	for (const component of COMPONENTS) {
		if (!originals.some((item) => item.name === component.id && item.type === "registry:ui")) {
			throw new Error(`缺少原始组件：${component.id}`);
		}
	}
	const files = new Map<string, RegistryItemFile>();
	const css: CssSchema = {};
	// utils must stay a dependency: its special CLI alias resolution depends on item.name.
	const bundled = new Set(
		originals.filter((item) => item.name !== "utils").map((item) => item.name)
	);
	const registryDependencies = new Set<string>();
	const dependencies = new Set<string>();
	const devDependencies = new Set<string>();
	for (const item of originals) {
		for (const dependency of item.dependencies ?? []) dependencies.add(dependency);
		for (const dependency of item.devDependencies ?? []) devDependencies.add(dependency);
		for (const dependency of item.registryDependencies ?? []) {
			// Bare names refer to this registry. A remote URL may identify a different
			// component with the same basename and must not be silently discarded.
			if (!bundled.has(dependency)) registryDependencies.add(dependency);
		}
		if (item.name === "utils") {
			registryDependencies.add("utils");
			continue;
		}
		if (item.css) mergeCss(css, item.css);
		for (const original of item.files ?? []) {
			const file = applyBehaviorDefaults(normalizeFile(original, item), validated);
			if (file.content.includes("$UTILS$")) registryDependencies.add("utils");
			const previous = files.get(file.target);
			if (previous && (previous.content !== file.content || previous.type !== file.type)) {
				throw new Error(`组件文件冲突：${file.target}`);
			}
			files.set(file.target, file);
		}
	}
	for (const target of [
		"button/button.svelte",
		"dialog/dialog-content.svelte",
		"tooltip/tooltip-provider.svelte",
		"tooltip/tooltip-content.svelte",
		"accordion/accordion.svelte",
	]) {
		if (!files.has(target)) throw new Error(`缺少原始组件文件：${target}`);
	}
	mergeCss(css, cssRecord(postcss.parse(createWorkbenchCss(validated))));
	return registryItemSchema.parse({
		name: "valar-workbench-preset",
		type: "registry:ui",
		title: validated.name,
		description: "Valar 原生 Svelte 组件设计预设；保留 Bits UI 交互与调用方属性覆盖。",
		files: [...files.values()],
		dependencies: [...dependencies],
		devDependencies: [...devDependencies],
		registryDependencies: [...registryDependencies],
		css,
		meta: { workbenchPreset: validated },
	});
}
