<script lang="ts">
	import { page } from "$app/state";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let { class: className, href, children, ...restProps }: HTMLAnchorAttributes = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const localizedHref = $derived(typeof href === "string" ? localizeHref(href, locale) : href);
</script>

<a
	href={localizedHref}
	class={cn(
		"flex w-full flex-col items-center rounded-2xl bg-surface p-6 text-surface-foreground transition-colors hover:bg-surface/80 sm:p-10",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</a>
