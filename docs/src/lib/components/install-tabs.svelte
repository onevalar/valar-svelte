<script lang="ts">
	import * as DocTabs from "./doc-tabs/index.js";
	import CodeTabs from "./code-tabs.svelte";
	import { t } from "$lib/i18n/index.js";
	import type { Snippet } from "svelte";

	let {
		cli,
		manual,
	}: {
		cli: Snippet;
		manual: Snippet;
	} = $props();
</script>

<CodeTabs>
	<DocTabs.List>
		<DocTabs.Trigger value="cli">{t("install.command")}</DocTabs.Trigger>
		<DocTabs.Trigger value="manual">{t("install.manual")}</DocTabs.Trigger>
	</DocTabs.List>
	<DocTabs.Content value="cli">
		{@render cli?.()}
	</DocTabs.Content>
	<DocTabs.Content value="manual" data-manual-install="" data-llm-ignore>
		{@render manual?.()}
	</DocTabs.Content>
</CodeTabs>
