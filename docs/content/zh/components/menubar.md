---
title: 菜单栏
description: 桌面应用中常见的常驻菜单，可快速访问一组固定的命令。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/menubar
  doc: https://bits-ui.com/docs/components/menubar
  api: https://bits-ui.com/docs/components/menubar#api-reference
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

<ComponentPreview name="menubar-demo">

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="menubar" />
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
  import * as Menubar from "$lib/components/ui/menubar/index.js";
</script>
```

```svelte showLineNumbers
<Menubar.Root>
  <Menubar.Menu>
    <Menubar.Trigger>File</Menubar.Trigger>
    <Menubar.Content>
      <Menubar.Item>
        New Tab
        <Menubar.Shortcut>⌘T</Menubar.Shortcut>
      </Menubar.Item>
      <Menubar.Item>New Window</Menubar.Item>
      <Menubar.Separator />
      <Menubar.Item>Share</Menubar.Item>
      <Menubar.Separator />
      <Menubar.Item>Print</Menubar.Item>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>
```

## 复选框

用 `Menubar.CheckboxItem` 实现可勾选的菜单项。

<ComponentPreview name="menubar-checkbox">

<div></div>

</ComponentPreview>

## 单选按钮

用 `Menubar.RadioGroup` 和 `Menubar.RadioItem` 实现菜单项的互斥选择。

<ComponentPreview name="menubar-radio">

<div></div>

</ComponentPreview>

## 子菜单

用 `Menubar.Sub`、`Menubar.SubTrigger` 和 `Menubar.SubContent` 构建嵌套菜单。

<ComponentPreview name="menubar-submenu">

<div></div>

</ComponentPreview>

## 带图标

<ComponentPreview name="menubar-icons">

<div></div>

</ComponentPreview>
