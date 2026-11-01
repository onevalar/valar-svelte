---
title: 切换按钮组
description: 一组可在开与关两种状态之间切换的按钮。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/toggle-group
  doc: https://bits-ui.com/docs/components/toggle-group
  api: https://bits-ui.com/docs/components/toggle-group#api-reference
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

<ComponentPreview name="toggle-group-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="toggle-group" />
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
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
</script>
```

```svelte
<ToggleGroup.Root type="single">
  <ToggleGroup.Item value="a">A</ToggleGroup.Item>
  <ToggleGroup.Item value="b">B</ToggleGroup.Item>
  <ToggleGroup.Item value="c">C</ToggleGroup.Item>
</ToggleGroup.Root>
```

## 描边

传入 `variant="outline"` 使用描边样式。

<ComponentPreview name="toggle-group-outline">

<div></div>

</ComponentPreview>

## 尺寸

用 `size` 属性调整切换按钮组的尺寸。

<ComponentPreview name="toggle-group-sizes">

<div></div>

</ComponentPreview>

## 间距

用 `spacing` 设置切换按钮组各项之间的间距。

<ComponentPreview name="toggle-group-spacing">

<div></div>

</ComponentPreview>

## 纵向

传入 `orientation="vertical"` 使用纵向排列。

<ComponentPreview name="toggle-group-vertical">

<div></div>

</ComponentPreview>

## 禁用

<ComponentPreview name="toggle-group-disabled">

<div></div>

</ComponentPreview>

## 自定义

自定义切换按钮组的示例。

<ComponentPreview name="toggle-group-font-weight-selector" class="[&_[data-align]>[data-slot=field]]:max-w-xs">

<div></div>

</ComponentPreview>
