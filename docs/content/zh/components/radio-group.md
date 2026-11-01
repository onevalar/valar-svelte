---
title: 单选按钮组
description: 一组可选中按钮（即单选按钮），同一时间最多只能选中其中一个。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/radio-group
  doc: https://bits-ui.com/docs/components/radio-group
  api: https://bits-ui.com/docs/components/radio-group#api-reference
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

<ComponentPreview name="radio-group-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="radio-group" />
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
  import { Label } from "$lib/components/ui/label/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
</script>
```

```svelte showLineNumbers
<RadioGroup.Root value="option-one">
  <div class="flex items-center gap-3">
    <RadioGroup.Item value="option-one" id="option-one" />
    <Label for="option-one">Option One</Label>
  </div>
  <div class="flex items-center gap-3">
    <RadioGroup.Item value="option-two" id="option-two" />
    <Label for="option-two">Option Two</Label>
  </div>
</RadioGroup.Root>
```

## 描述

用 `Field` 组件为单选按钮项加上描述。

<ComponentPreview name="radio-group-description">

<div></div>

</ComponentPreview>

## 选择卡片

用 `Field.Label` 包裹整个 `Field.Field`，得到可点击的卡片式选项。

<ComponentPreview name="radio-group-choice-card">

<div></div>

</ComponentPreview>

## 字段集

用 `Field.Set` 和 `Field.Legend` 把单选按钮项组成一组，并带上标签和描述。

<ComponentPreview name="radio-group-fieldset">

<div></div>

</ComponentPreview>

## 禁用

给 `RadioGroup.Item` 传入 `disabled` 属性，可禁用单个选项。

<ComponentPreview name="radio-group-disabled">

<div></div>

</ComponentPreview>

## 无效状态

为 `RadioGroup.Item` 设置 `aria-invalid`，为 `Field.Field` 设置 `data-invalid`，即可显示校验错误。

<ComponentPreview name="radio-group-invalid">

<div></div>

</ComponentPreview>
