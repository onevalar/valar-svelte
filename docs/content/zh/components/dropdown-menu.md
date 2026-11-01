---
title: 下拉菜单
description: 显示由按钮触发的菜单，例如一组操作或功能。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/dropdown-menu
  doc: https://bits-ui.com/docs/components/dropdown-menu
  api: https://bits-ui.com/docs/components/dropdown-menu#api-reference
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

<ComponentPreview name="dropdown-menu-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="dropdown-menu" />
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
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
</script>
```

```svelte showLineNumbers
<DropdownMenu.Root>
  <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>My Account</DropdownMenu.Label>
      <DropdownMenu.Item>Profile</DropdownMenu.Item>
      <DropdownMenu.Item>Billing</DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item>Team</DropdownMenu.Item>
      <DropdownMenu.Item>Subscription</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## 基础用法

带标签和分割线的基础下拉菜单。

<ComponentPreview name="dropdown-menu-basic">

<div></div>

</ComponentPreview>

## 子菜单

用 `DropdownMenu.Sub` 嵌套次级操作。

<ComponentPreview name="dropdown-menu-submenu">

<div></div>

</ComponentPreview>

## 快捷键

加入 `DropdownMenu.Shortcut` 显示快捷键提示。

<ComponentPreview name="dropdown-menu-shortcuts">

<div></div>

</ComponentPreview>

## 图标

图标与标签搭配，便于快速浏览。

<ComponentPreview name="dropdown-menu-icons">

<div></div>

</ComponentPreview>

## 复选框

用 `DropdownMenu.CheckboxItem` 实现可勾选的菜单项。

<ComponentPreview name="dropdown-menu-checkboxes">

<div></div>

</ComponentPreview>

## 带图标的复选框

为复选项加上图标。

<ComponentPreview name="dropdown-menu-checkboxes-icons">

<div></div>

</ComponentPreview>

## 单选按钮组

用 `DropdownMenu.RadioGroup` 实现互斥选择。

<ComponentPreview name="dropdown-menu-radio-group">

<div></div>

</ComponentPreview>

## 带图标的单选按钮

带图标的单选选项。

<ComponentPreview name="dropdown-menu-radio-icons">

<div></div>

</ComponentPreview>

## 危险操作

不可逆操作使用 `variant="destructive"`。

<ComponentPreview name="dropdown-menu-destructive">

<div></div>

</ComponentPreview>

## 头像

由头像触发的账号切换下拉菜单。

<ComponentPreview name="dropdown-menu-avatar">

<div></div>

</ComponentPreview>

## 复杂示例

组合分组、图标和子菜单的完整示例。

<ComponentPreview name="dropdown-menu-complex">

<div></div>

</ComponentPreview>
