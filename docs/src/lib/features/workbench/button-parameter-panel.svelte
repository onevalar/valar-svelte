<script lang="ts">
	import { createDialKit, DialRoot, type DialConfig } from "dialkit/svelte";
	import { untrack } from "svelte";
	import {
		BUTTON_NUMBER_PARAMETERS,
		RADIUS_LABEL,
		RADIUS_LABELS,
		RADIUS_LEVELS,
		type ButtonValues,
		type RadiusLevel,
	} from "./button-tuning.js";

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
	const config: DialConfig = {
		[RADIUS_LABEL]: {
			type: "select",
			default: start.radius,
			options: RADIUS_LEVELS.map((value) => ({ value, label: RADIUS_LABELS[value] })),
		},
	};
	for (const parameter of BUTTON_NUMBER_PARAMETERS) {
		config[parameter.label] = [start[parameter.key], parameter.min, parameter.max, 1];
	}
	const values = createDialKit("尺寸与圆角", config);
	$effect(() => {
		onchange({
			radius: values[RADIUS_LABEL] as RadiusLevel,
			...Object.fromEntries(
				BUTTON_NUMBER_PARAMETERS.map(({ key, label }) => [key, Math.round(Number(values[label]))])
			),
		} as ButtonValues);
	});
</script>

<div data-testid="button-dials">
	<DialRoot mode="inline" {theme} productionEnabled />
</div>
