<script lang="ts">
	import { NumberField, type NumberFieldProps } from "$lib/components/ui/number-field/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Stepper, type StepperStep } from "$lib/components/ui/stepper/index.js";
	import { TagsInput } from "$lib/components/ui/tags-input/index.js";
	const settings: Partial<NumberFieldProps> = { min: -2, max: 2, step: 0.1 };
	const steps: StepperStep[] = [
		{ id: "first", title: "First" },
		{ id: "last", title: "Last" },
	];
	let result = $state("");
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		result = JSON.stringify([...new FormData(event.currentTarget)]);
	}}
>
	<NumberField {...settings} name="amount" defaultValue={0.3} aria-label="Amount" />
	<TagsInput name="tags" defaultValue={["Svelte"]} aria-label="Tags" />
	<button type="submit">Submit</button><button type="reset">Reset</button>
	<output>{result}</output>
</form>
<Slider type="single" value={35} aria-label="Volume" />
<Stepper {steps} aria-label="Checkout">
	{#snippet children({ step, next })}<p>{step.title}</p>
		<button onclick={next}>Next</button>{/snippet}
</Stepper>
