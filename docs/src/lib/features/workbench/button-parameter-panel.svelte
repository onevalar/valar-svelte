<script lang="ts">
	import { createDialKit, DialRoot, type DialConfig } from "dialkit/svelte";
	import { untrack } from "svelte";
	import { BUTTON_PARAMETERS, type ButtonValues } from "./button-tuning.js";

	let {
		initial,
		theme,
		onchange,
	}: {
		initial: ButtonValues;
		theme: "light" | "dark";
		onchange: (values: ButtonValues) => void;
	} = $props();
	const start = untrack(() => initial);
	const config: DialConfig = {};
	for (const parameter of BUTTON_PARAMETERS) {
		const value = start[parameter.property];
		if (parameter.type === "number") {
			config[parameter.label] = [Number(value), parameter.min, parameter.max, 0.1];
		} else if (parameter.type === "color") {
			config[parameter.label] = { type: "color", default: String(value) };
		} else {
			config[parameter.label] = {
				type: "select",
				default: String(value),
				options: [
					...new Set([String(value), "linear", "ease", "ease-in", "ease-out", "ease-in-out"]),
				],
			};
		}
	}
	const values = createDialKit("Button · 真实样式参数", config);
	$effect(() => {
		onchange(
			Object.fromEntries(
				BUTTON_PARAMETERS.map(({ property, label }) => [property, values[label]])
			) as ButtonValues
		);
	});
</script>

<div data-testid="button-dials">
	<DialRoot {theme} productionEnabled />
</div>
