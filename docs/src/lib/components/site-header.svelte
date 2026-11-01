<script lang="ts">
	import { page } from "$app/state";
	import SquareTerminal from "@lucide/svelte/icons/square-terminal";
	import Separator from "$lib/registry/ui/separator/separator.svelte";
	import { getColors } from "$lib/colors.js";
	import { getMainNavItems } from "$lib/navigation.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import CommandMenu from "./command-menu/command-menu.svelte";
	import GithubLink from "./github-link.svelte";
	import LanguageSwitcher from "./language-switcher.svelte";
	import LayoutToggle from "./layout-toggle.svelte";
	import MainNav from "./main-nav.svelte";
	import MobileNav from "./mobile-nav.svelte";
	import ModeSwitcher from "./mode-switcher.svelte";
	import { InitializeProjectCtx } from "../../routes/[[lang]]/(app)/(layout)/(create)/components/initialize-project-context.svelte.js";

	const initializeProjectCtx = InitializeProjectCtx.getOr(null);

	const colors = getColors();

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const mainNavItems = $derived(getMainNavItems(locale));

	let mobileNavRef: { closeMenu: () => void } | undefined;

	function closeMobileMenu() {
		if (mobileNavRef) {
			mobileNavRef.closeMenu();
		}
	}
</script>

<header class="sticky top-0 z-50 w-full bg-background">
	<div
		class="container-wrapper px-4 group-has-data-[slot=designer]/layout:max-w-none sm:px-6 3xl:fixed:px-0"
	>
		<div
			class="flex h-(--header-height) items-center **:data-[slot=separator]:h-4! **:data-[slot=separator]:self-center group-has-data-[slot=designer]/layout:fixed:max-w-none 3xl:fixed:container"
		>
			<MobileNav bind:this={mobileNavRef} class="flex lg:hidden" />

			<a
				href={locale === "zh" ? "/zh" : "/"}
				aria-label={t("header.home")}
				class="mr-2 ml-3 flex shrink-0 items-baseline gap-2 sm:mr-5 lg:ml-0"
			><span class="text-lg font-semibold tracking-tight">Valar</span><span
					class="text-xs text-muted-foreground">Svelte</span
				></a
			>
			<MainNav items={mainNavItems} class="hidden lg:flex" />
			<div class="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
				<div class="flex shrink-0 md:w-auto md:flex-none">
					<CommandMenu {colors} {closeMobileMenu} />
				</div>
				<Separator orientation="vertical" class="ml-2 hidden lg:block" />
				<LanguageSwitcher />
				<div class="hidden sm:block"><GithubLink /></div>
				<Separator orientation="vertical" class="hidden 3xl:flex" />
				<LayoutToggle class="hidden 3xl:flex" />
				<Separator orientation="vertical" class="hidden sm:block" />
				{#if page.url.pathname.startsWith(locale === "zh" ? "/zh/create" : "/create")}
					<ModeSwitcher class="md:hidden" />
					<Separator orientation="vertical" />
					{#if initializeProjectCtx}
						<Button
							onclick={() => (initializeProjectCtx.open = true)}
							variant="default"
							size="sm"
							class="hidden md:flex"
						>
							<SquareTerminal />
							{t("header.initializeProject")}
						</Button>
					{/if}
				{:else}
					<ModeSwitcher />
				{/if}
			</div>
		</div>
	</div>
</header>
