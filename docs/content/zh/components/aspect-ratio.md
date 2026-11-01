---
title: 宽高比
description: 按指定宽高比展示内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/aspect-ratio
  doc: https://bits-ui.com/docs/components/aspect-ratio
  api: https://bits-ui.com/docs/components/aspect-ratio#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="aspect-ratio-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="aspect-ratio" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `bits-ui`：

</Step>

<PMInstall command="bits-ui -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## 用法

```svelte showLineNumbers
<script lang="ts">
  import { AspectRatio } from "$lib/components/ui/aspect-ratio/index.js";
</script>
```

```svelte showLineNumbers
<AspectRatio ratio={16 / 9}>
  <img src="..." alt="Image" class="rounded-md object-cover" />
</AspectRatio>
```

## 正方形

通过 `ratio={1 / 1}` 属性设置 1:1 的宽高比。适合以正方形展示图片。

<ComponentPreview name="aspect-ratio-square">

<div></div>

</ComponentPreview>

## 竖版

通过 `ratio={9 / 16}` 属性设置 9:16 的宽高比。适合以竖版展示图片。

<ComponentPreview name="aspect-ratio-portrait">

<div></div>

</ComponentPreview>
