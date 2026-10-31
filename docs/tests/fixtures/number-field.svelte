<script lang="ts">
	import {
		NumberField,
		type NumberFieldProps,
	} from "../../src/lib/registry/ui/number-field/index.js";
	let settings = $state<NumberFieldProps>({
		value: 0.05,
		name: "rate",
		step: 0.01,
		formatOptions: { style: "percent" },
	});
	export function set(next: Partial<NumberFieldProps>) {
		settings = { ...settings, ...next };
	}
</script>

<NumberField {...settings} />
