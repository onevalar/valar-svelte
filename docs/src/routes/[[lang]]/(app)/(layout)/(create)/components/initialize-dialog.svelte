<script lang="ts">
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import BookOpenIcon from "@lucide/svelte/icons/book-open";
	import CheckIcon from "@lucide/svelte/icons/check";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import { page } from "$app/state";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import Callout from "$lib/components/callout.svelte";
	import PMExecute from "$lib/components/pm-execute.svelte";
	import { useDesignSystem } from "$lib/features/design-system/index.js";
	import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
	import { getCommand, type PackageManager } from "$lib/package-manager.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { UserConfigContext } from "$lib/user-config.svelte.js";
	import {
		InitializeProjectContext,
		InitializeProjectCtx,
	} from "./initialize-project-context.svelte.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();

	const initializeProjectCtx = InitializeProjectCtx.set(new InitializeProjectContext());

	const designSystem = useDesignSystem();
	const userConfig = UserConfigContext.get();

	const clipboard = new UseClipboard();

	const command = $derived(`@valar/svelte-cli init --preset ${designSystem.preset} --cwd /absolute/path/to/your-app`);

	function commandTextForPm(agent: PackageManager) {
		const resolved = getCommand(agent, "execute", command);
		return `${resolved.command} ${resolved.args.join(" ")}`.trim();
	}

	const fullCommand = $derived(commandTextForPm(userConfig.current.packageManager));

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const link = (href: string) => localizeHref(href, locale);
</script>

<Dialog.Root bind:open={initializeProjectCtx.open}>
	<Dialog.Content class="w-full max-w-lg!">
		<Dialog.Header>
			<Dialog.Title>{t("create.initialize")}</Dialog.Title>
			<Dialog.Description>{t("create.initializeNote")}</Dialog.Description>
		</Dialog.Header>
		<Callout class="-mb-6 w-full md:mx-0" icon={BookOpenIcon} title={t("create.setupFirst")}>
			{t("create.setupBefore")}
			<a
				href={link("/docs/installation")}
				class="font-medium underline underline-offset-4 hover:text-primary"
			>
				{t("create.installationDocs")}
			</a>
			{t("create.setupAfter")}
		</Callout>
		<Tooltip.Provider>
			<PMExecute {command} />
		</Tooltip.Provider>
		<Dialog.Footer>
			<Button variant="default" class="w-full" onclick={() => clipboard.copy(fullCommand)}>
				{#if clipboard.copied}
					<CheckIcon />
				{:else}
					<CopyIcon />
				{/if}
				Copy Command
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
{@render children?.()}
