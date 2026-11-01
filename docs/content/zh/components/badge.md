---
title: 徽标
description: 显示徽标，或外观与徽标一致的组件。
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/badge
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

<ComponentPreview name="badge-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="badge" />
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

```svelte
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
</script>
```

```svelte
<Badge variant="default | outline | secondary | destructive">Badge</Badge>
```

## 变体

用 `variant` 属性切换徽标的变体。

<ComponentPreview name="badge-variants">

<div></div>

</ComponentPreview>

## 带图标

徽标内可以放图标。`data-icon="inline-start"` 让图标显示在左侧，`data-icon="inline-end"` 显示在右侧。

<ComponentPreview name="badge-icon">

<div></div>

</ComponentPreview>

## 带加载指示器

徽标内可以放加载指示器。给加载指示器加上 `data-icon="inline-start"` 或 `data-icon="inline-end"` 属性，间距才会正确。

<ComponentPreview name="badge-spinner">

<div></div>

</ComponentPreview>

## 链接

传入 `href` 属性，徽标会渲染成链接。

<ComponentPreview name="badge-link">

<div></div>

</ComponentPreview>

## 自定义颜色

给 `Badge` 组件加上 `bg-green-50 dark:bg-green-800` 这类自定义类名，即可定制徽标的颜色。

<ComponentPreview name="badge-colors">

<div></div>

</ComponentPreview>
