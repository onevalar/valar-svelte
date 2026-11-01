---
title: 原生选择器
description: 带样式的原生 HTML select 元素，与设计系统保持一致。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/native-select
---

<script>
    import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
    import PMAddComp from "$lib/components/pm-add-comp.svelte";
    import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
    import Step from "$lib/components/step.svelte";
    import Steps from "$lib/components/steps.svelte";
    import Callout from "$lib/components/callout.svelte";
    import InfoIcon from "@lucide/svelte/icons/info";
</script>

<Callout variant="info" icon={InfoIcon} class="!translate-y-[3px]" >

需要带样式的选择器组件时，见[选择器](/docs/components/select)。

</Callout>

<ComponentPreview name="native-select-demo" />

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="native-select" />
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
  import * as NativeSelect from "$lib/components/ui/native-select/index.js";
</script>
```

```svelte showLineNumbers
<NativeSelect.Root>
  <NativeSelect.Option value="">Select a fruit</NativeSelect.Option>
  <NativeSelect.Option value="apple">Apple</NativeSelect.Option>
  <NativeSelect.Option value="banana">Banana</NativeSelect.Option>
  <NativeSelect.Option value="blueberry">Blueberry</NativeSelect.Option>
  <NativeSelect.Option value="grapes" disabled>Grapes</NativeSelect.Option>
  <NativeSelect.Option value="pineapple">Pineapple</NativeSelect.Option>
</NativeSelect.Root>
```

## 分组

使用 `NativeSelect.OptGroup` 把选项分组归类。

<ComponentPreview name="native-select-groups">

<div></div>

</ComponentPreview>

## 禁用

给 `NativeSelect.Root` 传入 `disabled` 属性即可禁用选择器。

<ComponentPreview name="native-select-disabled">

<div></div>

</ComponentPreview>

## 无效

传入 `aria-invalid` 显示校验错误；要定制样式，在 `Field.Field` 组件上添加 `data-invalid` 属性。

<ComponentPreview name="native-select-invalid">

<div></div>

</ComponentPreview>

## 原生选择器与选择器的区别

- 需要浏览器原生行为、更好的性能或针对移动端优化的下拉菜单时，使用 `NativeSelect`。
- 需要自定义样式、动画或复杂交互时，使用 `Select`。

## API 参考

### NativeSelect.Root

包装原生 HTML select 元素的主选择器组件。

| 属性    | 类型     | 默认值 |
| ------- | -------- | ------- |
| `class` | `string` |         |

其余属性透传给底层的 `<select>` 元素。

```svelte
<NativeSelect.Root>
  <NativeSelect.Option value="option1">Option 1</NativeSelect.Option>
  <NativeSelect.Option value="option2">Option 2</NativeSelect.Option>
</NativeSelect.Root>
```

### NativeSelect.Option

表示选择器中的单个选项。

| 属性       | 类型      | 默认值  |
| ---------- | --------- | ------- |
| `value`    | `string`  |         |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  |         |

其余属性透传给底层的 `<option>` 元素。

```svelte
<NativeSelect.Option value="apple">Apple</NativeSelect.Option>
<NativeSelect.Option value="banana" disabled>Banana</NativeSelect.Option>
```

### NativeSelect.OptGroup

把相关选项归入同一组，便于组织。

| 属性       | 类型      | 默认值  |
| ---------- | --------- | ------- |
| `label`    | `string`  |         |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  |         |

其余属性透传给底层的 `<optgroup>` 元素。

```svelte
<NativeSelect.OptGroup label="Fruits">
  <NativeSelect.Option value="apple">Apple</NativeSelect.Option>
  <NativeSelect.Option value="banana">Banana</NativeSelect.Option>
</NativeSelect.OptGroup>
```
