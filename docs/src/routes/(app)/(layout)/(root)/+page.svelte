<svelte:options runes />

<script lang="ts">
	import Announcement from "$lib/components/announcement.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import PageActions from "$lib/components/page-header/page-actions.svelte";
	import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
	import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
	import PageHeader from "$lib/components/page-header/page-header.svelte";
	import Button from "$lib/registry/ui/button/button.svelte";

	import CardsDemo from "./cards/cards-demo.svelte";

	const title = "Valar，始于组件。";
	const description =
		"为自己的产品建立一致的界面。Svelte 是 Valar 的第一个实现，组件、区块与源码都由你掌握。";


</script>

<Metadata {title} {description} />

<div class="flex flex-1 flex-col">
	<PageHeader class="md:**:[.container]:pb-8 lg:**:[.container]:pb-12">
		<Announcement />
		<PageHeaderHeading class="max-w-4xl">{title}</PageHeaderHeading>
		<PageHeaderDescription>{description}</PageHeaderDescription>
		<PageActions class="style-luma">
			<Button href="/docs/installation" class="h-[35px]">开始使用</Button>
			<Button href="/docs/components" variant="secondary">浏览组件</Button>
		</PageActions>
	</PageHeader>
	<div class="container-wrapper flex-1 p-0">
		<div class="container overflow-hidden md:px-0 lg:max-w-none">

				<section>
					<div class="style-rhea theme-neutral">
						<CardsDemo />
					</div>
				</section>

		</div>
	</div>
</div>
