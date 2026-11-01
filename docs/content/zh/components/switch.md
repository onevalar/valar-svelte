---
title: 开关
description: 在选中与未选中状态之间切换的控件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/switch
  doc: https://bits-ui.com/docs/components/switch
  api: https://bits-ui.com/docs/components/switch#api-reference
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

<ComponentPreview name="switch-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="switch" />
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
  import { Switch } from "$lib/components/ui/switch/index.js";
</script>
```

```svelte
<Switch />
```

## 描述

<ComponentPreview name="switch-description">

<div></div>

</ComponentPreview>

## 选择卡片

卡片样式的选择：`Field.Label` 包裹整个 `Field.Field`，整张卡片都可点击。

<ComponentPreview name="switch-choice-card">

<div></div>

</ComponentPreview>

## 禁用

给 `Switch` 组件传入 `disabled` 属性即可禁用开关，并为 `Field.Field` 组件加上 `data-disabled` 属性，以应用禁用样式。

<ComponentPreview name="switch-disabled">

<div></div>

</ComponentPreview>

## 无效

给 `Switch` 组件传入 `aria-invalid` 属性表示无效状态，并为 `Field.Field` 组件加上 `data-invalid` 属性，以应用无效样式。

<ComponentPreview name="switch-invalid">

<div></div>

</ComponentPreview>

## 尺寸

用 `size` 属性调整开关尺寸。

<ComponentPreview name="switch-sizes">

<div></div>

</ComponentPreview>
