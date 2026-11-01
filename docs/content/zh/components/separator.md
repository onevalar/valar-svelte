---
title: 分割线
description: 在视觉或语义上分隔内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/separator
  doc: https://bits-ui.com/docs/components/separator
  api: https://bits-ui.com/docs/components/separator#api-reference
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

<ComponentPreview name="separator-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="separator" />
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
  import { Separator } from "$lib/components/ui/separator/index.js";
</script>
```

```svelte showLineNumbers
<Separator />
```

## 纵向

传入 `orientation="vertical"` 使用纵向分割线。

<ComponentPreview name="separator-vertical">

<div></div>

</ComponentPreview>

## 菜单

带描述的菜单项之间使用纵向分割线。

<ComponentPreview name="separator-menu">

<div></div>

</ComponentPreview>

## 列表

列表项之间使用横向分割线。

<ComponentPreview name="separator-list">

<div></div>

</ComponentPreview>

## API 参考

更多信息见 [Bits UI Separator](https://bits-ui.com/docs/components/separator#api-reference) 文档。
