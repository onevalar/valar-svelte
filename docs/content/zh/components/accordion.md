---
title: 折叠面板
description: 纵向堆叠的可交互标题组，每个标题展开一段内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/accordion
  doc: https://bits-ui.com/docs/components/accordion
  api: https://bits-ui.com/docs/components/accordion#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
	import Step from "$lib/components/step.svelte";

	let { viewerData } = $props();

</script>

<ComponentPreview name="accordion-demo" class="**:[.preview]:min-h-[300px] [&_.preview>[data-slot=accordion]]:max-w-sm" description="An accordion with three items" align="start">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>

{#snippet cli()}

<PMAddComp name="accordion" />

{/snippet}

{#snippet manual()}

<Steps>

<Step>

安装 `bits-ui`

</Step>

<PMInstall command="bits-ui" />

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
  import * as Accordion from "$lib/components/ui/accordion/index.js";
</script>
```

```svelte showLineNumbers
<Accordion.Root type="single">
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
    <Accordion.Content>
      Yes. It adheres to the WAI-ARIA design pattern.
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

## 基础用法

基础折叠面板一次只展开一项，默认展开第一项。

<ComponentPreview name="accordion-basic" align="start" class="**:[.preview]:min-h-[300px] [&_.preview>[data-slot=accordion]]:max-w-sm">

<div></div>

</ComponentPreview>

## 多选

传入 `type="multiple"`，可以同时展开多项。

<ComponentPreview name="accordion-multiple" align="start" class="**:[.preview]:min-h-[450px] [&_.preview>[data-slot=accordion]]:max-w-sm">

<div></div>

</ComponentPreview>

## 禁用

在 `Accordion.Item` 上传入 `disabled` 属性，可单独禁用某一项。

<ComponentPreview name="accordion-disabled" align="start" class="**:[.preview]:min-h-[300px] [&_.preview>[data-slot=accordion]]:max-w-sm">

<div></div>

</ComponentPreview>

## 边框

给 `Accordion.Root` 加上 `border`，给 `Accordion.Item` 加上 `border-b last:border-b-0`，即可为各项加上边框。

<ComponentPreview name="accordion-borders" align="start" class="**:[.preview]:min-h-[300px] [&_.preview>[data-slot=accordion]]:max-w-sm">

<div></div>

</ComponentPreview>

## 卡片

用卡片组件包裹 `Accordion.Root`。

<ComponentPreview name="accordion-card" align="start" class="**:[.preview]:min-h-[435px] [&_.preview>[data-slot=accordion]]:max-w-sm">

<div></div>

</ComponentPreview>
