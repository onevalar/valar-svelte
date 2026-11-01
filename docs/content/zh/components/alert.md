---
title: 提示框
description: 显示需要用户注意的提示信息。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/alert
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

<ComponentPreview name="alert-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="alert" />
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
  import * as Alert from "$lib/components/ui/alert/index.js";
</script>
```

```svelte showLineNumbers
<Alert.Root>
  <InfoIcon />
  <Alert.Title>Heads up!</Alert.Title>
  <Alert.Description>
    You can add components and dependencies to your app using the cli.
  </Alert.Description>
  <Alert.Action>
    <Button variant="outline">Enable</Button>
  </Alert.Action>
</Alert.Root>
```

## 基础用法

带图标、标题和描述的提示框。

<ComponentPreview name="alert-basic">

<div></div>

</ComponentPreview>

## 危险

传入 `variant="destructive"` 创建危险提示框。

<ComponentPreview name="alert-destructive">

<div></div>

</ComponentPreview>

## 操作

用 `Alert.Action` 为提示框添加按钮或其他操作元素。

<ComponentPreview name="alert-action">

<div></div>

</ComponentPreview>

## 自定义颜色

给 `Alert.Root` 加上 `bg-amber-50 dark:bg-amber-950` 这类自定义类名，即可调整提示框配色。

<ComponentPreview name="alert-colors">

<div></div>

</ComponentPreview>
