<script lang="ts">
	import { createDialKit, DialRoot, type DialConfig } from "dialkit/svelte";
	import { untrack } from "svelte";
	import { PARAMETERS, type ComponentId, type WorkbenchPreset } from "./model.js";

	let {
		component,
		preset,
		onchange,
	}: {
		component: ComponentId;
		preset: WorkbenchPreset;
		onchange: (values: WorkbenchPreset["values"]) => void;
	} = $props();

	// The parent keys this component on component selection, undo, reset and import.
	const initial = untrack(() => ({ component, preset }));
	const parameters = PARAMETERS.filter(
		(parameter) => parameter.component === "global" || parameter.component === initial.component
	);
	const groupName = (parameter: (typeof PARAMETERS)[number]) =>
		`${parameter.component === "global" ? "全局" : "当前组件"} · ${parameter.group}`;
	const config: DialConfig = {};
	for (const parameter of parameters) {
		const group = groupName(parameter);
		const folder = (config[group] ??= {}) as DialConfig;
		const value = initial.preset.values[parameter.key];
		if (parameter.type === "number") {
			folder[parameter.label] = [
				Number(value),
				parameter.min!,
				parameter.max!,
				parameter.step ?? 1,
			];
		} else if (parameter.type === "select") {
			folder[parameter.label] = {
				type: "select",
				options: parameter.options!,
				default: String(value),
			};
		} else if (parameter.type === "color") {
			folder[parameter.label] = { type: "color", default: String(value) };
		} else if (parameter.type === "text") {
			folder[parameter.label] = { type: "text", default: String(value) };
		} else {
			folder[parameter.label] = Boolean(value);
		}
	}
	// No stable ID or DialKit persistence: the validated parent draft is the single source of truth.
	const values = createDialKit("参数调节", config);
	$effect(() => {
		const next: WorkbenchPreset["values"] = {};
		for (const parameter of parameters) {
			const folder: unknown = values[groupName(parameter)];
			if (folder && typeof folder === "object") {
				const value: unknown = Reflect.get(folder, parameter.label);
				if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
					next[parameter.key] = value;
				}
			}
		}
		onchange(next);
	});
</script>

<div class="parameter-panel" data-testid="parameter-panel">
	<DialRoot mode="inline" theme="light" productionEnabled versions="menu" />
</div>
<details class="border-t px-5 py-4 text-xs leading-6 text-muted-foreground">
	<summary class="cursor-pointer font-medium text-foreground">参数说明与单位</summary>
	<dl class="mt-3 space-y-2">
		{#each parameters as parameter (parameter.key)}
			<div>
				<dt class="font-medium text-foreground">{parameter.label}</dt>
				<dd>{parameter.description}</dd>
			</div>
		{/each}
	</dl>
</details>

<style>
	.parameter-panel {
		min-width: 0;
		color-scheme: light;
	}
	.parameter-panel :global(.dialkit-root[data-mode="inline"]) {
		width: 100%;
		max-width: 100%;
	}
	/* Versions and export belong to the workbench, not a second ephemeral per-panel history. */
	.parameter-panel :global(.dialkit-panel-header) {
		display: none;
	}
</style>
