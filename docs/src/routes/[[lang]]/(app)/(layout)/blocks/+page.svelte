<script lang="ts">
	import BlockViewer from "$lib/components/block-viewer.svelte";
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { page } from "$app/state";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);
</script>

<div class="flex flex-col gap-12 md:gap-24">
	{#each data.blocks as block (block.name)}
		<BlockViewer item={block} tree={createFileTreeForRegistryItemFiles(block.files)}>
			<ComponentPreview
				name={block.name}
				hideCode
				class="my-0 **:[.preview]:h-auto **:[.preview]:p-4 **:[.preview>.p-6]:p-0"
			/>
		</BlockViewer>
	{/each}
	<div class="container-wrapper">
		<div class="container flex justify-center py-6">
			<Button href={localizeHref("/blocks/sidebar", locale)} variant="outline"
				>{t("blocks.browseAll")}</Button
			>
		</div>
	</div>
</div>
