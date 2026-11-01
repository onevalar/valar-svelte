<!-- DialKit panel for a component editor, built from the spec's parameter list. -->
<script lang="ts">
	import { createDialKit, DialRoot, type DialConfig } from "dialkit/svelte";
	import { untrack } from "svelte";
	import type { TunerParameter, TunerValues } from "./tuner.js";

	let {
		group,
		parameters,
		initial,
		theme,
		testid,
		onchange,
	}: {
		group: string;
		parameters: readonly TunerParameter[];
		initial: TunerValues;
		theme: "light" | "dark";
		testid: string;
		onchange: (values: TunerValues) => void;
	} = $props();
	const start = untrack(() => initial);
	const config: DialConfig = {};
	for (const parameter of untrack(() => parameters)) {
		config[parameter.label] =
			parameter.kind === "select"
				? {
						type: "select",
						default: String(start[parameter.key]),
						options: parameter.options.map((option) => ({ ...option })),
					}
				: [Number(start[parameter.key]), parameter.min, parameter.max, parameter.step ?? 1];
	}
	const values = createDialKit(
		untrack(() => group),
		config
	);
	$effect(() => {
		onchange(
			Object.fromEntries(
				parameters.map((parameter) => {
					const value = values[parameter.label];
					if (parameter.kind === "select") return [parameter.key, String(value)];
					const step = parameter.step ?? 1;
					return [parameter.key, Math.round(Number(value) / step) * step];
				})
			)
		);
	});
</script>

<div data-testid={testid}>
	<DialRoot mode="inline" {theme} productionEnabled />
</div>
