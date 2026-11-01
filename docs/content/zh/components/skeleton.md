---
title: 骨架屏
description: 在内容加载期间显示占位符。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/skeleton
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

<ComponentPreview name="skeleton-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="skeleton" />
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
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>
```

```svelte
<Skeleton class="h-[20px] w-[100px] rounded-full" />
```

## 头像

<ComponentPreview name="skeleton-avatar">

<div></div>

</ComponentPreview>

## 卡片

<ComponentPreview name="skeleton-card">

<div></div>

</ComponentPreview>

## 文本

<ComponentPreview name="skeleton-text">

<div></div>

</ComponentPreview>

## 表单

<ComponentPreview name="skeleton-form">

<div></div>

</ComponentPreview>

## 表格

<ComponentPreview name="skeleton-table">

<div></div>

</ComponentPreview>
