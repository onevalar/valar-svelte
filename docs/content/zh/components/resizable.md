---
title: 可调整面板
description: 面板组与布局可调整大小，支持键盘操作，兼顾无障碍。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/resizable
  doc: https://www.paneforge.com
  api: https://www.paneforge.com/docs/components/pane-group
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

<ComponentPreview name="resizable-demo">

<div></div>

</ComponentPreview>

## 关于

可调整面板组件基于 [PaneForge](https://github.com/svecosystem/paneforge) 构建。可调整面板支持的全部属性与能力见 [PaneForge 文档](https://paneforge.com)。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="resizable" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `paneforge`：

</Step>

<PMInstall command="paneforge@next -D" />

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
  import * as Resizable from "$lib/components/ui/resizable/index.js";
</script>
```

```svelte showLineNumbers
<Resizable.PaneGroup direction="horizontal">
  <Resizable.Pane>One</Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane>Two</Resizable.Pane>
</Resizable.PaneGroup>
```

## 垂直

传入 `direction="vertical"` 切换为垂直方向调整。

<ComponentPreview name="resizable-vertical">

<div></div>

</ComponentPreview>

## 手柄

给 `Resizable.Handle` 传入 `withHandle` 属性，显示可见的手柄。

<ComponentPreview name="resizable-handle">

<div></div>

</ComponentPreview>
