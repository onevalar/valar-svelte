---
title: 弹出层
description: 在传送门中显示富内容，由按钮触发。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/popover
  doc: https://bits-ui.com/docs/components/popover
  api: https://bits-ui.com/docs/components/popover#api-reference
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

<ComponentPreview name="popover-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="popover" />
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
  import * as Popover from "$lib/components/ui/popover/index.js";
</script>
```

```svelte showLineNumbers
<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Content>Place content for the popover here.</Popover.Content>
</Popover.Root>
```

## 基础用法

带页头、标题和描述的简单弹出层。

<ComponentPreview name="popover-basic">

<div></div>

</ComponentPreview>

## 对齐

用 `Popover.Content` 的 `align` 属性控制水平对齐。

<ComponentPreview name="popover-alignments">

<div></div>

</ComponentPreview>

## 带表单

内部包含表单字段的弹出层。

<ComponentPreview name="popover-form">

<div></div>

</ComponentPreview>
