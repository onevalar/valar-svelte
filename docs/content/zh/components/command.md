---
title: 命令面板
description: 用于搜索和快速操作的命令面板。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/command
  doc: https://bits-ui.com/docs/components/command
  api: https://bits-ui.com/docs/components/command#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import Callout from "$lib/components/callout.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="command-demo" align="start" previewClassName="min-h-0 h-[24.5rem]">

<div></div>

</ComponentPreview>

## 关于

`<Command />` 组件使用 [Bits UI](https://bits-ui.com) 提供的 [`Command`](https://bits-ui.com/docs/components/command) 组件，灵感来自 [`cmdk`](https://github.com/dip/cmdk)。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="command" />
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
  import * as Command from "$lib/components/ui/command/index.js";
</script>
```

```svelte showLineNumbers
<Command.Root>
  <Command.Input placeholder="Type a command or search..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Suggestions">
      <Command.Item>Calendar</Command.Item>
      <Command.Item>Search Emoji</Command.Item>
      <Command.Item>Calculator</Command.Item>
    </Command.Group>
    <Command.Separator />
    <Command.Group heading="Settings">
      <Command.Item>Profile</Command.Item>
      <Command.Item>Billing</Command.Item>
      <Command.Item>Settings</Command.Item>
    </Command.Group>
  </Command.List>
</Command.Root>
```

## 基础用法

对话框中的简单命令面板。

<ComponentPreview name="command-basic">

<div></div>

</ComponentPreview>

## 快捷键

<ComponentPreview name="command-shortcuts">

<div></div>

</ComponentPreview>

## 分组

带分组、图标和分割线的命令面板。

<ComponentPreview name="command-groups">

<div></div>

</ComponentPreview>

## 可滚动

包含多个条目、可滚动的命令面板。

<ComponentPreview name="command-scrollable">

<div></div>

</ComponentPreview>
