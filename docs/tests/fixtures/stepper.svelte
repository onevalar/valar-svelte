<script lang="ts">
	import { Stepper, type StepperProps } from "../../src/lib/registry/ui/stepper/index.js";
	let settings = $state<StepperProps>({
		steps: [
			{ id: "alpha", title: "Alpha" },
			{ id: "beta", title: "Beta" },
			{ id: "gamma", title: "Gamma" },
		],
	});
	let current = $state("alpha");
	let api: ReturnType<typeof Stepper>;
	export function set(next: Partial<StepperProps>) {
		const { value, ...rest } = next;
		if (value !== undefined) current = value;
		settings = { ...settings, ...rest };
	}
	export function goTo(id: string) {
		return api.goTo(id);
	}
</script>

<Stepper {...settings} bind:value={current} bind:this={api}>
	{#snippet children({ step, next, previous })}
		<input aria-label={step.title} />
		<button onclick={previous}>Back</button><button onclick={next}>Next</button>
	{/snippet}
</Stepper>
