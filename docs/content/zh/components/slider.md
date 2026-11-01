---
title: 滑块
description: 在给定范围内选择数值的输入控件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/slider
  doc: https://bits-ui.com/docs/components/slider
  api: https://bits-ui.com/docs/components/slider#api-reference
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

<ComponentPreview name="slider-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="slider" />
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

```svelte
<script lang="ts">
  import { Slider } from "$lib/components/ui/slider/index.js";
  let value = $state(33);
</script>
```

```svelte
<Slider type="single" aria-label="Volume" bind:value max={100} step={1} />
```

## 无障碍名称

通过 `aria-label` 或 `aria-labelledby` 为可聚焦的滑块手柄命名，而不仅是外部轨道。指向根元素 `id` 的 HTML 标签不能为内部手柄命名。使用 `aria-labelledby` 时，引用可见文本的 ID。

多个手柄通过 `thumbLabels` 按数值顺序分别命名：

```svelte
<Slider
  type="multiple"
  value={[20, 80]}
  thumbLabels={["Minimum price", "Maximum price"]}
/>
```

按 ARIA 命名优先级，`aria-labelledby` 优先于 `aria-label`。

## 范围

传入 `type="multiple"` 和包含两个值的数组，得到范围滑块。

<ComponentPreview name="slider-range">

<div></div>

</ComponentPreview>

## 多个手柄

传入包含多个值的数组，得到多个手柄。

<ComponentPreview name="slider-multiple">

<div></div>

</ComponentPreview>

## 垂直

传入 `orientation="vertical"` 得到垂直滑块。

<ComponentPreview name="slider-vertical">

<div></div>

</ComponentPreview>

## 受控用法

<ComponentPreview name="slider-controlled">

<div></div>

</ComponentPreview>

## 禁用

传入 `disabled` 禁用滑块。

<ComponentPreview name="slider-disabled">

<div></div>

</ComponentPreview>
