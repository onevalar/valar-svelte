---
title: 输入框
description: 用于表单与数据录入的文本输入框，内置样式与无障碍支持。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/input
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

<ComponentPreview name="input-demo" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="input" />
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

```svelte
<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
</script>
```

```svelte
<Input />
```

## 基础用法

<ComponentPreview name="input-basic" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 表单字段

用 `Field.Field`、`Field.Label` 和 `Field.Description` 给输入框加上标签与描述。

<ComponentPreview name="input-field" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 字段组

用 `Field.Group` 组织多个 `Field.Field` 块，搭建表单。

<ComponentPreview name="input-fieldgroup" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 禁用

传入 `disabled` 属性禁用输入框。要定制禁用状态的样式，在 `Field.Field` 组件上添加 `data-disabled` 属性。

<ComponentPreview name="input-disabled" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 无效

传入 `aria-invalid` 属性把输入框标记为无效。要定制无效状态的样式，在 `Field.Field` 组件上添加 `data-invalid` 属性。

<ComponentPreview name="input-invalid" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 文件

传入 `type="file"` 属性创建文件输入框。

<ComponentPreview name="input-file" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 行内

把 `Field.Field` 与 `orientation="horizontal"` 搭配，得到行内输入框。再配合 `Button`，即可组成带按钮的搜索输入框。

<ComponentPreview name="input-inline" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 网格

用网格布局并排放置多个输入框。

<ComponentPreview name="input-grid">

<div></div>

</ComponentPreview>

## 必填

用 `required` 属性标记必填输入框。

<ComponentPreview name="input-required" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 徽标

在标签里使用 `Badge`，突出推荐填写的字段。

<ComponentPreview name="input-badge" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 输入框组

要在输入框内加入图标、文本或按钮，使用 `InputGroup` 组件。更多示例见[输入框组](/docs/components/input-group)组件。

<ComponentPreview name="input-input-group" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 按钮组

要给输入框添加按钮，使用 `ButtonGroup` 组件。更多示例见[按钮组](/docs/components/button-group)组件。

<ComponentPreview name="input-button-group" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 表单

完整表单示例，包含多个输入框、一个选择器和一个按钮。

<ComponentPreview name="input-form">

<div></div>

</ComponentPreview>
