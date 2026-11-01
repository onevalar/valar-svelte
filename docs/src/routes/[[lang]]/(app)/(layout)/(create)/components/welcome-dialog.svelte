<script lang="ts">
	import { t } from "$lib/i18n/index.js";
	import { PersistedState } from "runed";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import Logo from "$lib/components/logo.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";

	const dismissed = new PersistedState("valar-create-welcome-dialog", false);
</script>

<Dialog.Root bind:open={() => !dismissed.current, (v) => (dismissed.current = !v)}>
	<Dialog.Content
		showCloseButton={false}
		class="dialog-ring max-w-92 min-w-0 gap-0 overflow-hidden rounded-xl p-0 sm:max-w-sm dark:bg-neutral-900"
	>
		<div
			class="flex aspect-[2/1.2] w-full items-center justify-center rounded-t-xl bg-neutral-950 text-center text-neutral-100 sm:aspect-2/1"
		>
			<div class="font-mono text-2xl font-bold">
				<Logo class="size-12" />
			</div>
		</div>
		<Dialog.Header class="gap-1 p-4">
			<Dialog.Title class="text-left text-base">{t("create.welcomeTitle")}</Dialog.Title>
			<Dialog.Description class="text-left leading-relaxed text-foreground">
				{t("create.welcomeDescription")}
			</Dialog.Description>
			<Dialog.Description class="mt-2 text-left leading-relaxed font-medium text-foreground">
				{t("create.welcomeAvailable")}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="m-0">
			<Dialog.Close>
				{#snippet child({ props })}
					<Button class="w-full rounded-lg shadow-none" {...props}>{t("create.getStarted")}</Button>
				{/snippet}
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
