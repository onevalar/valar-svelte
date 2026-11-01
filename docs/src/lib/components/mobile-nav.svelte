<script lang="ts">
	import { page } from "$app/state";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { getMainNavItems, getSidebarNavItems, PAGES_NEW } from "$lib/navigation.js";
	import { Button, type ButtonProps } from "$lib/registry/ui/button/index.js";
	import type { Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";
	import LanguageSwitcher from "./language-switcher.svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	type MobileLinkProps = HTMLAnchorAttributes & {
		content?: string;
	};

	let { class: className, ...restProps }: ButtonProps = $props();

	let open = $state(false);

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const mainNavItems = $derived(getMainNavItems(locale));
	const sidebarNavItems = $derived(getSidebarNavItems(locale));

	// Expose a function to close the mobile menu
	let closeMenu = () => {
		open = false;
	};

	export { closeMenu };
</script>

{#snippet MobileLink({ href, content, class: className, ...props }: MobileLinkProps)}
	<a
		{href}
		onclick={() => {
			open = false;
		}}
		class={cn("flex items-center gap-2 text-2xl font-medium", className)}
		{...props}
	>
		{content}
		{#if href && PAGES_NEW.includes(href)}
			<span class="flex size-2 rounded-full bg-svelte-orange" title={t("nav.new")}></span>
		{/if}
	</a>
{/snippet}

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				{...restProps}
				variant="ghost"
				class={cn(
					"extend-touch-target h-8 touch-manipulation items-center justify-start gap-2.5 !p-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:!translate-y-0 active:bg-transparent active:!opacity-100 data-[state=open]:bg-transparent dark:hover:bg-transparent",
					className
				)}
			>
				<div class="relative flex h-8 w-4 items-center justify-center">
					<div class="relative size-4">
						<span
							class={cn(
								"absolute start-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
								open ? "top-[0.4rem] -rotate-45" : "top-1"
							)}
						></span>
						<span
							class={cn(
								"absolute start-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
								open ? "top-[0.4rem] rotate-45" : "top-2.5"
							)}
						></span>
					</div>
					<span class="sr-only">{t("nav.toggleMenu")}</span>
				</div>
				<span class="sr-only">{t("nav.menu")}</span>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		class="no-scrollbar h-(--bits-popover-content-available-height) w-(--bits-popover-content-available-width) overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100"
		align="start"
		side="bottom"
		alignOffset={-16}
		sideOffset={14}
		preventScroll
	>
		<div class="flex flex-col gap-12 overflow-auto px-6 py-6">
			<div class="flex items-center justify-between">
				<div class="text-sm font-medium text-muted-foreground">{t("nav.menu")}</div>
				<LanguageSwitcher class="-mr-2" />
			</div>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-3">
					{#each mainNavItems as item, i (i)}
						{@render MobileLink({ href: item.href, content: item.title })}
					{/each}
				</div>
			</div>
			<div class="flex flex-col gap-8">
				{#each sidebarNavItems as group (group.title)}
					<div class="flex flex-col gap-4">
						<div class="text-sm font-medium text-muted-foreground">
							{group.title}
						</div>
						<div class="flex flex-col gap-3">
							{#each group.items as item, i (i)}
								{@render MobileLink({ href: item.href, content: item.title })}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
