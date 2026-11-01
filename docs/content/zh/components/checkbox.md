---
title: 复选框
description: 用于在选中与未选中状态之间切换的控件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/checkbox
  doc: https://bits-ui.com/docs/components/checkbox
  api: https://bits-ui.com/docs/components/checkbox#api-reference
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

<ComponentPreview name="checkbox-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="checkbox" />
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
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
</script>
```

```svelte
<Checkbox />
```

## 选中状态

用 `bind:checked` 绑定复选框状态，或用 `onCheckedChange` 监听状态变化。

```svelte showLineNumbers
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";

  let checked = $state(false);
</script>

<Checkbox bind:checked />
```

## 无效状态

为复选框设置 `aria-invalid`，并为外层字段容器设置 `data-invalid`，即可显示无效样式。

<ComponentPreview name="checkbox-invalid">

<div></div>

</ComponentPreview>

## 基础用法

复选框配合 `Field.Field` 和 `Field.Label` 使用，获得正确的布局与标签。

<ComponentPreview name="checkbox-basic">

<div></div>

</ComponentPreview>

## 描述

辅助文字使用 `Field.Content` 和 `Field.Description`。

<ComponentPreview name="checkbox-description">

<div></div>

</ComponentPreview>

## 禁用

传入 `disabled` 属性阻止交互，并为 `<Field.Field>` 组件加上 `data-disabled` 属性，以应用禁用样式。

<ComponentPreview name="checkbox-disabled">

<div></div>

</ComponentPreview>

## 分组

用多个字段组成复选框列表。

<ComponentPreview name="checkbox-group">

<div></div>

</ComponentPreview>

## 表格

<ComponentPreview name="checkbox-table">

<div></div>

</ComponentPreview>
