---
title: 按钮组
description: 将相关按钮组合在一起并保持样式一致的容器。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/button-group
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

<ComponentPreview name="button-group-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="button-group" />
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
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
</script>
```

```svelte
<ButtonGroup.Root>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup.Root>
```

## 无障碍

- `ButtonGroup.Root` 组件把 `role` 属性设为 `group`。
- 用 `Tab` 键在组内按钮之间切换焦点。
- 用 `aria-label` 或 `aria-labelledby` 为按钮组命名。

```svelte showLineNumbers
<ButtonGroup.Root aria-label="Button group">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup.Root>
```

## 按钮组与切换按钮组

- 需要把执行操作的按钮归为一组时，使用 `ButtonGroup` 组件。
- 需要把切换状态的按钮归为一组时，使用 `ToggleGroup` 组件。

## 方向

传入 `orientation` 属性改变按钮组的排列方向。

<ComponentPreview name="button-group-orientation-demo">

<div></div>

</ComponentPreview>

## 尺寸

在单个按钮上设置 `size` 属性控制按钮尺寸。

<ComponentPreview name="button-group-size-demo">

<div></div>

</ComponentPreview>

## 嵌套

嵌套 `<ButtonGroup.Root>` 组件，创建带间距的按钮组。

<ComponentPreview name="button-group-nested-demo">

<div></div>

</ComponentPreview>

## 分割线

`ButtonGroup.Separator` 组件在视觉上分隔组内的按钮。

`outline` 变体的按钮自带边框，不需要分割线。其他变体建议加上分割线，让视觉层级更清晰。

<ComponentPreview name="button-group-separator-demo">

<div></div>

</ComponentPreview>

## 拆分按钮

添加两个用 `ButtonGroup.Separator` 分隔的按钮，创建拆分按钮组。

<ComponentPreview name="button-group-split-demo">

<div></div>

</ComponentPreview>

## 输入框

用按钮包裹 `Input` 组件。

<ComponentPreview name="button-group-input-demo">

<div></div>

</ComponentPreview>

## 输入框组

包裹 `InputGroup` 组件，构建复杂的输入布局。

<ComponentPreview name="button-group-input-group-demo">

<div></div>

</ComponentPreview>

## 下拉菜单

用 `DropdownMenu` 组件创建拆分按钮组。

<ComponentPreview name="button-group-dropdown-menu-demo">

<div></div>

</ComponentPreview>

## 选择器

与 `Select` 组件搭配使用。

<ComponentPreview name="button-group-select-demo">

<div></div>

</ComponentPreview>

## 弹出层

与 `Popover` 组件一起使用。

<ComponentPreview name="button-group-popover-demo">

<div></div>

</ComponentPreview>
