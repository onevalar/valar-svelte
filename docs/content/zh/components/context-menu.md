---
title: 右键菜单
description: 显示由右键触发的操作菜单。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/context-menu
  doc: https://bits-ui.com/docs/components/context-menu
  api: https://bits-ui.com/docs/components/context-menu#api-reference
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

<ComponentPreview name="context-menu-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="context-menu" />
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
  import * as ContextMenu from "$lib/components/ui/context-menu/index.js";
</script>
```

```svelte showLineNumbers
<ContextMenu.Root>
  <ContextMenu.Trigger>Right click here</ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item>Profile</ContextMenu.Item>
    <ContextMenu.Item>Billing</ContextMenu.Item>
    <ContextMenu.Item>Team</ContextMenu.Item>
    <ContextMenu.Item>Subscription</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

## 基础用法

包含几个操作的基础右键菜单。

<ComponentPreview name="context-menu-basic">

<div></div>

</ComponentPreview>

## 子菜单

用 `ContextMenu.Sub` 嵌套次级操作。

<ComponentPreview name="context-menu-submenu">

<div></div>

</ComponentPreview>

## 快捷键

加入 `ContextMenu.Shortcut` 显示键盘提示。

<ComponentPreview name="context-menu-shortcuts">

<div></div>

</ComponentPreview>

## 分组

把相关操作归为一组，用分割线隔开。

<ComponentPreview name="context-menu-groups">

<div></div>

</ComponentPreview>

## 图标

图标与标签搭配，便于快速浏览。

<ComponentPreview name="context-menu-icons">

<div></div>

</ComponentPreview>

## 复选框

用 `ContextMenu.CheckboxItem` 实现开关式选项。

<ComponentPreview name="context-menu-checkboxes">

<div></div>

</ComponentPreview>

## 单选按钮

用 `ContextMenu.RadioItem` 实现互斥选项。

<ComponentPreview name="context-menu-radio">

<div></div>

</ComponentPreview>

## 危险操作

传入 `variant="destructive"`，菜单项即改用危险操作样式。

<ComponentPreview name="context-menu-destructive">

<div></div>

</ComponentPreview>

## 方向

用 `side` 和 `align` 属性控制子菜单的显示位置。

<ComponentPreview name="context-menu-sides">

<div></div>

</ComponentPreview>
