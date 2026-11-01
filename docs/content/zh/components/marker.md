---
title: 标记
description: 在对话中显示行内状态、系统提示、带边框的行或带标签的分隔线。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/marker
---

<script>
	import Callout from "$lib/components/callout.svelte";
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="marker-demo" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

`Marker` 组件显示对话中的行内标记，例如状态更新、系统提示、带边框的行和带标签的分隔线。在对话线程中与 [`Message`](/docs/components/message) 组合使用。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="marker" />
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
  import * as Marker from "$lib/components/ui/marker/index.js";
</script>
```

```svelte showLineNumbers
<Marker.Root>
  <Marker.Icon>
    <CheckIcon />
  </Marker.Icon>
  <Marker.Content>Explored 4 files</Marker.Content>
</Marker.Root>
```

## 组合

按以下组合方式构建标记：

```text
Marker.Root
├── Marker.Icon
└── Marker.Content
```

## 特性

- 行内标记、带边框的行和带标签的分隔线三种变体
- 装饰性图标插槽，对辅助技术隐藏
- 通过 `child` 片段让根元素支持多态，可渲染为链接或按钮标记
- 与 [`shimmer`](/docs/utils/shimmer) 工具搭配，用于流式状态文本
- 每个部件都通过 `class` 属性支持自定义样式

## 变体

用 `variant` 在行内标记、带边框的行和带标签的分隔线之间切换。

<ComponentPreview name="marker-variants" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

| 变体        | 说明                             |
| ----------- | -------------------------------- |
| `default`   | 行内标记，用于状态、提示和操作。 |
| `border`    | 默认标记，下方加一条底边框。     |
| `separator` | 居中标签，两侧带分隔线。         |

## 状态

为流式或进行中的标记设置 `role="status"`，并加入 [`Spinner`](/docs/components/spinner)，让更新被播报。

<ComponentPreview name="marker-status" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 微光

给 `Marker.Content` 加上 [`shimmer`](/docs/utils/shimmer) 工具类，获得流式文本的动画效果。该工具随 `Valar Svelte` 包提供，安装方式见 shimmer 文档。

<ComponentPreview name="marker-shimmer" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 分隔线

需要带标签的分隔线时用 `separator` 变体，例如对话中的日期或章节分隔。

<ComponentPreview name="marker-separator" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 边框

`border` 变体用于状态行：保持默认标记的对齐方式，同时与下一行分隔开。

<ComponentPreview name="marker-border" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 带图标

用 `Marker.Icon` 在内容旁渲染图标。用 `flex-col` 把图标叠到内容上方。

<ComponentPreview name="marker-icon" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 链接与按钮

在 `Marker.Root` 上使用 `child` 片段，把标记变成链接或按钮。

<ComponentPreview name="marker-link-button" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<script lang="ts">
  import * as Marker from "$lib/components/ui/marker/index.js";
</script>

<Marker.Root>
  {#snippet child({ props })}
    <a href="#/" {...props}>
      <Marker.Content>View the pull request</Marker.Content>
    </a>
  {/snippet}
</Marker.Root>
```

## 无障碍

`Marker` 默认只负责呈现。正确的语义取决于用法，因此按意图选择 role，不要依赖单一的默认值。

### 状态与进度

流式或进度标记，例如“Thinking...”或运行中的工具，设置 `role="status"`，辅助技术会在更新出现时播报。`Marker` 把 `role` 透传给下层元素。

```svelte showLineNumbers
<Marker.Root role="status">
  <Marker.Icon>
    <Spinner />
  </Marker.Icon>
  <Marker.Content>Compacting conversation</Marker.Content>
</Marker.Root>
```

### 带标签的分隔线

带文本的分隔线，例如日期或章节标签，不需要 role。分隔线由装饰性的 CSS 伪元素绘制，文本按普通内容朗读。

```svelte showLineNumbers
<Marker.Root variant="separator">
  <Marker.Content>Today</Marker.Content>
</Marker.Root>
```

<Callout>

**注意：** 不要给带标签的分隔线加 `role="separator"`。该角色的无障碍名称来自 `aria-label`，而不是其中的文本；内容也会被视为呈现性内容，可见的标签不会被播报。把 `role="separator"` 留给没有实际文本的分隔线。

</Callout>

### 带边框的标记

带边框的标记与默认标记语义相同。底边框只是装饰，按标记的用途选择 `role="status"`、`child` 片段或不加 role。

```svelte showLineNumbers
<Marker.Root variant="border">
  <Marker.Icon>
    <FileTextIcon />
  </Marker.Icon>
  <Marker.Content>Opened implementation notes</Marker.Content>
</Marker.Root>
```

### 装饰性图标

`Marker.Icon` 属于装饰内容，通过 `aria-hidden` 对辅助技术隐藏，含义由相邻的 `Marker.Content` 承载。纯图标标记要提供 `aria-label` 或可见文本，避免被朗读成空内容。

```svelte showLineNumbers
<Marker.Root aria-label="Synced">
  <Marker.Icon>
    <CheckIcon />
  </Marker.Icon>
</Marker.Root>
```

### 可交互的标记

标记用于链接或触发操作时，通过 `child` 片段渲染为真正的 `<button>` 或 `<a>`，这样才能获得焦点并暴露正确的角色。无障碍名称取自标记文本。

```svelte showLineNumbers
<Marker.Root>
  {#snippet child({ props })}
    <a href="/files" {...props}>
      <Marker.Icon>
        <FileTextIcon />
      </Marker.Icon>
      <Marker.Content>Explored 4 files</Marker.Content>
    </a>
  {/snippet}
</Marker.Root>
```

## API 参考

### Marker

标记的根元素。该文件还导出 `markerVariants`，用于把标记样式组合进自定义组件。

| 属性      | 类型                                   | 默认值      | 说明                     |
| --------- | -------------------------------------- | ----------- | ------------------------ |
| `variant` | `"default" \| "border" \| "separator"` | `"default"` | 标记的布局。             |
| `child`   | `snippet`                              | -           | 渲染为子元素，例如链接。 |
| `class`   | `string`                               | -           | 附加到根元素的类名。     |

### Marker.Icon

装饰性图标插槽。通过 `aria-hidden` 对辅助技术隐藏。

| 属性    | 类型     | 默认值 | 说明                   |
| ------- | -------- | ------ | ---------------------- |
| `class` | `string` | -      | 附加到图标插槽的类名。 |

### Marker.Content

标记的文本内容。

| 属性    | 类型     | 默认值 | 说明                   |
| ------- | -------- | ------ | ---------------------- |
| `class` | `string` | -      | 附加到内容插槽的类名。 |
