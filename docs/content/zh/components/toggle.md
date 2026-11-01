---
title: 切换按钮
description: 可在开与关两种状态之间切换的按钮。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/toggle
  doc: https://bits-ui.com/docs/components/toggle
  api: https://bits-ui.com/docs/components/toggle#api-reference
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

<ComponentPreview name="toggle-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="toggle" />
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

```svelte
<script lang="ts">
  import { Toggle } from "$lib/components/ui/toggle/index.js";
</script>
```

```svelte
<Toggle>Toggle</Toggle>
```

## 描边

传入 `variant="outline"` 使用描边样式。

<ComponentPreview name="toggle-outline">

<div></div>

</ComponentPreview>

## 带文本

<ComponentPreview name="toggle-with-text">

<div></div>

</ComponentPreview>

## 尺寸

用 `size` 属性调整切换按钮的尺寸。

<ComponentPreview name="toggle-sizes">

<div></div>

</ComponentPreview>

## 禁用

<ComponentPreview name="toggle-disabled">

<div></div>

</ComponentPreview>
