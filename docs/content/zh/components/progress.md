---
title: 进度条
description: 显示任务完成进度的指示器，通常表现为进度条。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/progress
  doc: https://bits-ui.com/docs/components/progress
  api: https://bits-ui.com/docs/components/progress#api-reference
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

<ComponentPreview name="progress-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="progress" />
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
  import { Progress } from "$lib/components/ui/progress/index.js";
</script>
```

```svelte showLineNumbers
<Progress value={33} />
```

## 标签

用 `Field` 组件为进度条添加标签。

<ComponentPreview name="progress-label">

<div></div>

</ComponentPreview>

## 受控用法

由滑块控制的进度条。

<ComponentPreview name="progress-controlled">

<div></div>

</ComponentPreview>
