<script lang="ts">
	import { page } from "$app/state";
	import ScrollArea from "$lib/registry/ui/scroll-area/scroll-area.svelte";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const examples = $derived([
		{
			name: t("examples.dashboard"),
			href: localizeHref("/examples/dashboard", locale),
			code: "https://github.com/onevalar/valar-svelte/tree/main/docs/src/routes/[[lang]]/(app)/(layout)/examples/dashboard",
			hidden: false,
		},
		{
			name: t("examples.tasks"),
			href: localizeHref("/examples/tasks", locale),
			code: "https://github.com/onevalar/valar-svelte/tree/main/docs/src/routes/[[lang]]/(app)/(layout)/examples/tasks",
			hidden: false,
		},
		{
			name: t("examples.playground"),
			href: localizeHref("/examples/playground", locale),
			code: "https://github.com/onevalar/valar-svelte/tree/main/docs/src/routes/[[lang]]/(app)/(layout)/examples/playground",
			hidden: false,
		},
		{
			name: t("examples.authentication"),
			href: localizeHref("/examples/authentication", locale),
			code: "https://github.com/onevalar/valar-svelte/tree/main/docs/src/routes/[[lang]]/(app)/(layout)/examples/authentication",
			hidden: false,
		},
	]);

	let { class: className, ...restProps }: HTMLAttributes<HTMLElement> = $props();
</script>

<div class={cn("flex items-center", className)} {...restProps}>
	<ScrollArea class="max-w-[96%] md:max-w-[600px] lg:max-w-none" orientation="both">
		<div class="flex items-center">
			{@render ExampleLink({
				example: {
					name: t("examples.title"),
					href: localizeHref("/examples", locale),
					code: "",
					hidden: false,
				},
				isActive: page.url.pathname === localizeHref("/examples", locale),
			})}
			{#each examples as example (example.href)}
				{@render ExampleLink({
					example,
					isActive: page.url.pathname?.startsWith(example.href) ?? false,
				})}
			{/each}
		</div>
	</ScrollArea>
</div>

{#snippet ExampleLink({
	example,
	isActive,
}: {
	example: (typeof examples)[number];
	isActive: boolean;
})}
	{#if !example.hidden}
		<a
			href={example.href}
			class="flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"
			data-active={isActive}
		>
			{example.name}
		</a>
	{/if}
{/snippet}
