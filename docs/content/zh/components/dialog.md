---
title: 对话框
description: 叠加在主窗口或其他对话框之上的窗口，打开后下层内容不可交互。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/dialog
  doc: https://bits-ui.com/docs/components/dialog
  api: https://bits-ui.com/docs/components/dialog#api-reference
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

<ComponentPreview name="dialog-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="dialog" />
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
  import * as Dialog from "$lib/components/ui/dialog/index.js";
</script>
```

```svelte showLineNumbers
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
```

## 自定义关闭按钮

用自定义按钮替换默认的关闭控件。

<ComponentPreview name="dialog-close-button">

<div></div>

</ComponentPreview>

## 无关闭按钮

传入 `showCloseButton={false}` 隐藏关闭按钮。

<ComponentPreview name="dialog-no-close-button">

<div></div>

</ComponentPreview>

## 粘性页脚

内容滚动时，操作按钮保持可见。

<ComponentPreview name="dialog-sticky-footer">

<div></div>

</ComponentPreview>

## 可滚动内容

内容较长时可滚动，头部始终可见。

<ComponentPreview name="dialog-scrollable-content">

<div></div>

</ComponentPreview>
