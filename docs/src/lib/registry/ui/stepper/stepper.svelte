<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	export type StepperStep = {
		id: string;
		title: string;
		description?: string;
		disabled?: boolean;
		completed?: boolean;
		error?: string;
	};
	export type StepperContext = {
		step: StepperStep;
		index: number;
		active: boolean;
		pending: boolean;
		error: string;
		next: () => Promise<boolean>;
		previous: () => Promise<boolean>;
		goTo: (id: string) => Promise<boolean>;
	};
	export type StepperProps = WithElementRef<
		Omit<HTMLAttributes<HTMLDivElement>, "children" | "onchange">,
		HTMLDivElement
	> & {
		steps: StepperStep[];
		value?: string;
		defaultValue?: string;
		linear?: boolean;
		disabled?: boolean;
		orientation?: "horizontal" | "vertical";
		beforeChange?: (
			from: string,
			to: string,
			signal: AbortSignal
		) => boolean | string | Promise<boolean | string>;
		onValueChange?: (value: string) => void;
		children?: Snippet<[StepperContext]>;
	};
</script>

<script lang="ts">
	import { onDestroy, tick, untrack } from "svelte";
	import { cn } from "$lib/utils.js";
	let {
		ref = $bindable(null),
		steps,
		defaultValue = steps.find((step) => !step.disabled)?.id ?? "",
		value = $bindable(defaultValue),
		linear = true,
		disabled = false,
		orientation = "horizontal",
		beforeChange,
		onValueChange,
		children,
		class: className,
		...restProps
	}: StepperProps = $props();
	const uid = $props.id();
	const topology = $derived(JSON.stringify(steps.map(({ id, disabled }) => [id, !!disabled])));
	const currentIndex = $derived(steps.findIndex((step) => step.id === value));
	let pending = $state(false);
	let error = $state("");
	const currentError = $derived(error || steps[currentIndex]?.error || "");
	let completed = $state<string[]>([]);
	let focused = $state("");
	let request = 0;
	let controller: AbortController | undefined;
	let lastValue = untrack(() => value);
	let lastTopology = untrack(() => topology);
	let lastGuard = untrack(() => beforeChange);
	let lastLinear = untrack(() => linear);
	let lastDisabled = untrack(() => disabled);
	let lastIndex = untrack(() => Math.max(0, currentIndex));

	function cancel() {
		request++;
		controller?.abort();
		controller = undefined;
		pending = false;
	}
	function update(id: string) {
		lastValue = id;
		value = id;
		focused = id;
		error = "";
		onValueChange?.(id);
	}
	$effect(() => {
		const current = value,
			signature = topology,
			guard = beforeChange,
			mode = linear,
			inactive = disabled;
		untrack(() => {
			if (
				current !== lastValue ||
				signature !== lastTopology ||
				guard !== lastGuard ||
				mode !== lastLinear ||
				inactive !== lastDisabled
			) {
				cancel();
				error = "";
				focused = "";
			}
			lastValue = current;
			lastTopology = signature;
			lastGuard = guard;
			lastLinear = mode;
			lastDisabled = inactive;
			if (currentIndex < 0 || steps[currentIndex]?.disabled) {
				const fallback =
					steps.slice(0, lastIndex).findLast((step) => !step.disabled) ??
					steps.find((step) => !step.disabled);
				if (value !== (fallback?.id ?? "")) update(fallback?.id ?? "");
			}
			lastIndex = Math.max(
				0,
				steps.findIndex((step) => step.id === value)
			);
			completed = completed.filter((id) => steps.some((step) => step.id === id));
		});
	});
	function reachable(index: number) {
		return index >= 0 && !steps[index]?.disabled && (!linear || index <= currentIndex + 1);
	}

	// All user and imperative navigation uses this gate; direct prop updates are trusted app state.
	export async function goTo(id: string): Promise<boolean> {
		const target = steps.findIndex((step) => step.id === id);
		if (disabled || !reachable(target)) return false;
		if (id === value) {
			if (pending) cancel();
			return false;
		}
		const forward = target > currentIndex;
		if (forward && pending) return false;
		cancel();
		const token = request;
		const origin = value;
		const signature = topology;
		if (forward) {
			controller = new AbortController();
			pending = true;
			error = "";
			try {
				const result = await (beforeChange?.(origin, id, controller.signal) ?? true);
				if (token !== request || value !== origin || topology !== signature || disabled)
					return false;
				if (result !== true) {
					error =
						typeof result === "string" ? result : "Please complete this step before continuing.";
					return false;
				}
				completed = [...new Set([...completed, origin])];
			} catch (cause) {
				if (token === request && value === origin && topology === signature)
					error = cause instanceof Error ? cause.message : "Unable to continue. Please retry.";
				return false;
			} finally {
				if (token === request) {
					pending = false;
					controller = undefined;
				}
			}
		}
		if (token !== request) return false;
		update(id);
		await tick();
		if (token === request && value === id) document.getElementById(panelId(id))?.focus();
		return true;
	}
	export function next() {
		return goTo(steps[currentIndex + 1]?.id ?? "");
	}
	export function previous() {
		return goTo(steps[currentIndex - 1]?.id ?? "");
	}
	function triggerId(id: string) {
		return `${uid}-trigger-${encodeURIComponent(id)}`;
	}
	function panelId(id: string) {
		return `${uid}-panel-${encodeURIComponent(id)}`;
	}
	function keydown(event: KeyboardEvent, index: number) {
		if (event.isComposing) return;
		const rtl = ref && getComputedStyle(ref).direction === "rtl";
		const nextKey = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
		const prevKey = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
		if (![nextKey, prevKey, "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const available = steps
			.map((_, i) => i)
			.filter((i) => reachable(i) && !(pending && i > currentIndex));
		const position = available.indexOf(index);
		const target =
			event.key === "Home"
				? available[0]
				: event.key === "End"
					? available.at(-1)
					: available[position + (event.key === nextKey ? 1 : -1)];
		if (target !== undefined) document.getElementById(triggerId(steps[target].id))?.focus();
	}
	onDestroy(() => {
		request++;
		controller?.abort();
	});
</script>

<div
	{...restProps}
	bind:this={ref}
	role="group"
	aria-label={restProps["aria-label"] ?? "Progress"}
	aria-busy={pending}
	data-slot="stepper"
	data-orientation={orientation}
	class={cn("grid w-full min-w-0 gap-5 text-foreground", className)}
>
	<ol
		class={cn(
			"flex min-w-0 gap-3",
			orientation === "vertical" ? "flex-col" : "flex-col sm:flex-row"
		)}
	>
		{#each steps as step, index (step.id)}
			{@const state =
				step.id === value && (error || step.error)
					? "error"
					: step.id === value
						? "active"
						: step.error
							? "error"
							: step.completed || completed.includes(step.id)
								? "completed"
								: "inactive"}
			<li class="min-w-0 flex-1">
				<button
					type="button"
					id={triggerId(step.id)}
					data-slot="stepper-trigger"
					data-state={state}
					aria-current={step.id === value ? "step" : undefined}
					aria-controls={panelId(step.id)}
					aria-describedby={[
						step.description ? `${triggerId(step.id)}-description` : "",
						step.id === value && currentError ? `${uid}-error` : "",
					]
						.filter(Boolean)
						.join(" ") || undefined}
					disabled={disabled || !reachable(index) || (pending && index > currentIndex)}
					tabindex={(focused || value) === step.id ? 0 : -1}
					class="flex w-full items-start gap-3 rounded-md border border-border bg-background p-3 text-start text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 data-[state=active]:border-primary data-[state=error]:border-destructive"
					onclick={() => goTo(step.id)}
					onkeydown={(event) => keydown(event, index)}
					onfocus={() => (focused = step.id)}
				>
					<span
						aria-hidden="true"
						class={cn(
							"flex size-7 shrink-0 items-center justify-center rounded-full border",
							state === "active" || state === "completed"
								? "border-primary bg-primary text-primary-foreground"
								: state === "error"
									? "border-destructive text-destructive"
									: "border-border text-muted-foreground"
						)}>{state === "completed" ? "✓" : state === "error" ? "!" : index + 1}</span
					>
					<span class="grid min-w-0 gap-1"
						><span class="font-medium break-words">{step.title}</span>{#if step.description}<span
								id={`${triggerId(step.id)}-description`}
								class="text-xs break-words text-muted-foreground">{step.description}</span
							>{/if}</span
					>
				</button>
			</li>
		{/each}
	</ol>
	<p class="sr-only" aria-live="polite">
		{pending ? "Validating step" : `Step ${currentIndex + 1} of ${steps.length}`}
	</p>
	{#if currentError}<p id={`${uid}-error`} role="alert" class="text-sm text-destructive">
			{currentError}
		</p>{/if}
	{#each steps as step, index (step.id)}
		<section
			id={panelId(step.id)}
			aria-labelledby={triggerId(step.id)}
			tabindex="-1"
			hidden={step.id !== value}
			class="min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
			data-slot="stepper-content"
		>
			{@render children?.({
				step,
				index,
				active: step.id === value,
				pending,
				error: step.id === value ? currentError : (step.error ?? ""),
				next,
				previous,
				goTo,
			})}
		</section>
	{/each}
</div>
