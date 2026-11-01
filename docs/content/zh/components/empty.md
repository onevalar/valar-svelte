---
title: 空状态
description: 无数据时展示空状态的组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/empty
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

<ComponentPreview name="empty-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="empty" />
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
  import * as Empty from "$lib/components/ui/empty/index.js";
  import FolderCodeIcon from "@tabler/icons-svelte/icons/folder-code";
</script>
```

```svelte
<Empty.Root>
  <Empty.Header>
    <Empty.Media variant="icon">
      <FolderCodeIcon />
    </Empty.Media>
    <Empty.Title>No data</Empty.Title>
    <Empty.Description>No data found</Empty.Description>
  </Empty.Header>
  <Empty.Content>
    <Button>Add data</Button>
  </Empty.Content>
</Empty.Root>
```

## 描边

用 `border` 工具类为空状态添加描边。

<ComponentPreview name="empty-outline-demo">

<div></div>

</ComponentPreview>

## 背景

用 `bg-*` 和 `bg-gradient-*` 工具类为空状态添加背景。

<ComponentPreview name="empty-background-demo">

<div></div>

</ComponentPreview>

## 头像

用 `Empty.Media` 组件在空状态中展示头像。

<ComponentPreview name="empty-avatar-demo">

<div></div>

</ComponentPreview>

## 头像组

用 `Empty.Media` 组件在空状态中展示头像组。

<ComponentPreview name="empty-avatar-group-demo">

<div></div>

</ComponentPreview>

## 输入框组

在 `Empty.Content` 组件中加入 `InputGroup` 组件。

<ComponentPreview name="empty-input-group-demo">

<div></div>

</ComponentPreview>
