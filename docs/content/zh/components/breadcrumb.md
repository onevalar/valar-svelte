---
title: 面包屑导航
description: 用层级链接显示当前资源所在路径。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/breadcrumb
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

<ComponentPreview name="breadcrumb-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="breadcrumb" />
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
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
</script>
```

```svelte showLineNumbers
<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/components">Components</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

## 基础用法

带首页链接和组件链接的基础面包屑导航。

<ComponentPreview name="breadcrumb-basic">

<div></div>

</ComponentPreview>

## 自定义分隔符

把自定义组件作为 `children` 传入 `<Breadcrumb.Separator />`，即可替换默认分隔符。

<ComponentPreview name="breadcrumb-separator">

<div></div>

</ComponentPreview>

## 下拉菜单

把 `<Breadcrumb.Item />` 与 `<DropdownMenu />` 组合，可在面包屑导航中加入下拉菜单。

<ComponentPreview name="breadcrumb-dropdown">

<div></div>

</ComponentPreview>

## 折叠显示

面包屑导航过长时，用 `<Breadcrumb.Ellipsis />` 组件显示折叠状态。

<ComponentPreview name="breadcrumb-ellipsis">

<div></div>

</ComponentPreview>

## 链接组件

给 `<Breadcrumb.Link />` 加上 `href` 属性，即可渲染为链接。

<ComponentPreview name="breadcrumb-link">

<div></div>

</ComponentPreview>
