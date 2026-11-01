---
title: 列表项
description: 用于展示媒体、标题、描述与操作的多用途组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/item
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

<ComponentPreview name="item-demo">

<div></div>

</ComponentPreview>

`Item` 组件是一个简单的弹性容器，几乎可以容纳任何类型的内容。用它展示标题、描述与操作，再用 `Item.Group` 组件组合成列表。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="item" />
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
  import * as Item from "$lib/components/ui/item/index.js";
</script>
```

```svelte showLineNumbers
<Item.Root>
  <Item.Header>Item Header</Item.Header>
  <Item.Media />
  <Item.Content>
    <Item.Title>Item</Item.Title>
    <Item.Description>Item</Item.Description>
  </Item.Content>
  <Item.Actions />
  <Item.Footer>Item Footer</Item.Footer>
</Item.Root>
```

## 列表项与表单字段

需要展示复选框、输入框、单选按钮或选择器这类表单控件时，用表单字段。

如果只需要展示标题、描述与操作，用 `Item`。

## 变体

用 `variant` 属性切换列表项的视觉样式。

<ComponentPreview name="item-variants-demo">

<div></div>

</ComponentPreview>

## 尺寸

用 `size` 属性调整列表项尺寸。可选值为 `default`、`sm` 和 `xs`。

<ComponentPreview name="item-size-demo">

<div></div>

</ComponentPreview>

## 图标

用 `Item.Media` 搭配 `variant="icon"` 展示图标。

<ComponentPreview name="item-icon-demo">

<div></div>

</ComponentPreview>

## 头像

用 `Item.Media` 搭配 `variant="avatar"` 展示头像。

<ComponentPreview name="item-avatar-demo">

<div></div>

</ComponentPreview>

## 图片

用 `Item.Media` 搭配 `variant="image"` 展示图片。

<ComponentPreview name="item-image-demo">

<div></div>

</ComponentPreview>

## 分组

用 `Item.Group` 把相关列表项归为一组。

<ComponentPreview name="item-group-demo">

<div></div>

</ComponentPreview>

## 头部

用 `Item.Header` 在列表项内容上方添加头部。

<ComponentPreview name="item-header-demo">

<div></div>

</ComponentPreview>

## 链接

用 `child` 片段把列表项渲染成链接。悬停与焦点状态会作用在 `<a>` 元素上。

<ComponentPreview name="item-link-demo">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<Item.Root>
  {#snippet child({ props })}
    <a href="/dashboard" {...props}>
      <Item.Media variant="icon">
        <HomeIcon />
      </Item.Media>
      <Item.Content>
        <Item.Title>Dashboard</Item.Title>
        <Item.Description
          >Overview of your account and activity.</Item.Description
        >
      </Item.Content>
    </a>
  {/snippet}
</Item.Root>
```

## 下拉菜单

<ComponentPreview name="item-dropdown-demo">

<div></div>

</ComponentPreview>
