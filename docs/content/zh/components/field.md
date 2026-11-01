---
title: 表单字段
description: 组合标签、控件与帮助文本，构建无障碍的表单字段与分组输入。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/field
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

<ComponentPreview name="field-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="field" />
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
  import * as Field from "$lib/components/ui/field/index.js";
</script>
```

```svelte showLineNumbers
<Field.Set>
  <Field.Legend>Profile</Field.Legend>
  <Field.Description>This appears on invoices and emails.</Field.Description>
  <Field.Group>
    <Field.Field>
      <Field.Label for="name">Full name</Field.Label>
      <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
      <Field.Description
        >This appears on invoices and emails.</Field.Description
      >
    </Field.Field>
    <Field.Field>
      <Field.Label for="username">Username</Field.Label>
      <Input id="username" autocomplete="off" aria-invalid />
      <Field.Error>Choose another username.</Field.Error>
    </Field.Field>
    <Field.Field orientation="horizontal">
      <Switch id="newsletter" />
      <Field.Label for="newsletter">Subscribe to the newsletter</Field.Label>
    </Field.Field>
  </Field.Group>
</Field.Set>
```

## 结构

`Field` 系列组件用于组合无障碍表单。一个典型的字段结构如下：

```svelte
<Field.Field>
  <Field.Label for="input-id">Label</Field.Label>
  <!-- Input, Select, Switch, etc. -->
  <Field.Description>Optional helper text.</Field.Description>
  <Field.Error>Validation message.</Field.Error>
</Field.Field>
```

- `Field.Field` 是单个字段的核心容器。
- `Field.Content` 是纵向排列的弹性容器，把标签与描述归在一起。没有描述时可以省略。
- 用 `Field.Group` 包裹相关字段；需要语义分组时，把 `Field.Set` 与 `Field.Legend` 配合使用。

## 输入框

<ComponentPreview name="field-input">

<div></div>

</ComponentPreview>

## 多行输入框

<ComponentPreview name="field-textarea">

<div></div>

</ComponentPreview>

## 选择器

<ComponentPreview name="field-select">

<div></div>

</ComponentPreview>

## 滑块

<ComponentPreview name="field-slider">

<div></div>

</ComponentPreview>

## 字段集

<ComponentPreview name="field-field-set-demo">

<div></div>

</ComponentPreview>

## 复选框

<ComponentPreview name="field-checkbox">

<div></div>

</ComponentPreview>

## 单选按钮

<ComponentPreview name="field-radio">

<div></div>

</ComponentPreview>

## 开关

<ComponentPreview name="field-switch">

<div></div>

</ComponentPreview>

## 选择卡片

把 `Field.Field` 组件放进 `Field.Label` 内部，即可得到可选择的字段组。支持 `RadioGroup.Item`、`Checkbox` 和 `Switch` 组件。

<ComponentPreview name="field-choice-card">

<div></div>

</ComponentPreview>

## 字段组

用 `Field.Group` 纵向堆叠 `Field` 组件，再用 `Field.Separator` 分隔。

<ComponentPreview name="field-field-group-demo">

<div></div>

</ComponentPreview>

## 响应式布局

- **纵向字段：** 默认方向自上而下排列标签、控件与帮助文本，适合移动优先的布局。
- **横向字段：** 在 `Field` 上设置 `orientation="horizontal"`，标签与控件并排对齐。配合 `Field.Content` 让描述保持对齐。
- **响应式字段：** 设置 `orientation="responsive"`，字段会在感知容器宽度的父级内自动分栏。在 `Field.Group` 上应用 `@container/field-group` 类，即可在指定断点切换方向。

<ComponentPreview name="field-responsive-layout-demo">

<div></div>

</ComponentPreview>

## 校验与错误

- 在 `Field.Field` 上添加 `data-invalid`，整块字段切换到错误状态。
- 在输入控件本身加上 `aria-invalid`，供辅助技术识别。
- 把 `Field.Error` 渲染在控件之后或 `Field.Content` 内部，错误提示才能与字段对齐。

```svelte
<Field.Field data-invalid>
  <Field.Label for="email">Email</Field.Label>
  <Input id="email" type="email" aria-invalid />
  <Field.Error>Enter a valid email address.</Field.Error>
</Field.Field>
```

## 无障碍

- `Field.Set` 与 `Field.Legend` 把相关控件归为一组，方便键盘用户和辅助技术使用。
- `Field` 输出 `role="group"`，嵌套控件组合使用时即可继承 `Field.Label` 与 `Field.Legend` 的标注。
- `Field.Separator` 要少用，确保屏幕阅读器读到清晰的分区边界。
