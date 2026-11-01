---
title: 卡片
description: 显示带头部、内容与底部的卡片。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/card
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="card-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="card" />
{/snippet}
{#snippet manual()}
<Steps>

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
  import * as Card from "$lib/components/ui/card/index.js";
</script>
```

```svelte showLineNumbers
<Card.Root>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card Description</Card.Description>
    <Card.Action>Card Action</Card.Action>
  </Card.Header>
  <Card.Content>
    <p>Card Content</p>
  </Card.Content>
  <Card.Footer>
    <p>Card Footer</p>
  </Card.Footer>
</Card.Root>
```

## 尺寸

传入 `size="sm"` 把卡片设为小尺寸。小尺寸变体使用更小的间距。

<ComponentPreview name="card-small">

<div></div>

</ComponentPreview>

## 间距

除了 `size` 属性，还可用 `--card-spacing` CSS 变量控制各分区之间的间距和卡片各部件的内缩距离。

<ComponentPreview name="card-spacing" class="[&_.preview]:min-h-[34rem]">

<div></div>

</ComponentPreview>

用 `-mx-(--card-spacing)` 负外边距，让内容贴到卡片边缘，同时与卡片的内缩对齐。贴边内容位于底部之上时，在 `Card.Content` 上加 `-mb-(--card-spacing)` 去掉分区之间的间隙。

<ComponentPreview name="card-edge-to-edge" class="[&_.preview]:min-h-[28rem]">

<div></div>

</ComponentPreview>

## 图片

在卡片头部之前加入图片，得到带图的卡片。

<ComponentPreview name="card-image" class="[&_.preview]:min-h-[32rem]">

<div></div>

</ComponentPreview>
