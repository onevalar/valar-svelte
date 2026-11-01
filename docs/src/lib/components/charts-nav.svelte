<script lang="ts">
	import { page } from "$app/state";
	import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t, type MessageKey } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let { class: className, ...restProps }: HTMLAttributes<HTMLElement> = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const links = $derived(
		[
			{ key: "charts.area", type: "area" },
			{ key: "charts.bar", type: "bar" },
			{ key: "charts.line", type: "line" },
			{ key: "charts.pie", type: "pie" },
			{ key: "charts.radar", type: "radar" },
			{ key: "charts.radial", type: "radial" },
			{ key: "charts.tooltip", type: "tooltip" },
		].map((item) => ({
			name: t(item.key as MessageKey),
			href: localizeHref(`/charts/${item.type}#charts`, locale),
		}))
	);
</script>

<div class="relative overflow-hidden">
	<ScrollArea class="max-w-[600px] lg:max-w-none" orientation="both" scrollbarXClasses="invisible">
		<div class={cn("flex items-center", className)} {...restProps}>
			{#each links as link (link.href)}
				<a
					href={link.href}
					data-active={link.href.startsWith(page.url.pathname)}
					class={cn(
						"flex h-7 shrink-0 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"
					)}
				>
					{link.name}
				</a>
			{/each}
		</div>
	</ScrollArea>
</div>
