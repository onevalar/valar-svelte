---
title: 消息
description: 在对话中显示消息，支持可选的头像、头部、底部与对齐方式。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/message
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="message-demo" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

`Message` 组件负责对话中单条消息的排布，处理消息主体周围的头像、对齐、头部和底部。

在 AI 应用中，可以用 `Message` 组件渲染推理步骤、工具调用和助手消息。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="message" />
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
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as Bubble from "$lib/components/ui/bubble/index.js";
  import * as Message from "$lib/components/ui/message/index.js";
</script>
```

```svelte showLineNumbers
<Message.Root>
  <Message.Avatar>
    <Avatar.Root>
      <Avatar.Image src="/favicon.svg" alt="Valar" />
      <Avatar.Fallback>CN</Avatar.Fallback>
    </Avatar.Root>
  </Message.Avatar>
  <Message.Content>
    <Bubble.Root>
      <Bubble.Content>How can I help you today?</Bubble.Content>
    </Bubble.Root>
  </Message.Content>
</Message.Root>
```

**注意：** 行内布局由 `Message` 负责，包括头像、对齐、头部和底部。可见的消息主体用
[`Bubble`](/docs/components/bubble) 渲染在其内部。

## 组合

按以下组合方式构建消息：

```text
Message.Root
├── Message.Avatar
└── Message.Content
    ├── Message.Header
    ├── Bubble.Root
    └── Message.Footer
```

使用 `Message.Group` 把同一发送者的连续消息堆叠在一起：

```text
Message.Group
├── Message.Root
└── Message.Root
```

## 特性

- 通过 `align` 属性把发送者与接收者的消息行对齐到起始或末尾
- 头像插槽锚定在消息底部，不占用底部区域
- 头部与底部插槽，用于发送者名称、状态和消息操作
- 底部跟随消息所在的一侧；在 `align="end"` 的消息行上操作仍保持对齐
- 分组容器，用于堆叠同一发送者的连续消息
- 每个部件都接受 `class` 属性，可自定义样式

## 头像

使用 `Message.Avatar` 在消息旁渲染头像。在消息上设置 `align="end"`，头像会对齐到消息末尾。

<ComponentPreview name="message-avatar" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

| align   | 说明                       |
| ------- | -------------------------- |
| `start` | 消息对齐到对话起始位置。   |
| `end`   | 消息对齐到对话末尾位置。   |

## 分组

使用 `Message.Group` 把同一发送者的连续消息堆叠在一起。在靠前的消息上渲染空的 `Message.Avatar`，让它们与最后一条消息的头像保持对齐。

<ComponentPreview name="message-group" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 头部与底部

用 `Message.Header` 显示发送者名称，用 `Message.Footer` 显示送达状态、已读状态等元数据。

<ComponentPreview name="message-header-footer" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 操作

把消息级操作放在 `Message.Footer` 中，例如复制、重试或反馈按钮。

<ComponentPreview name="message-actions" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 附件

<ComponentPreview name="message-attachment" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 无障碍

`Message` 只负责布局呈现，无障碍语义来自放入其中的内容。

### 为纯图标操作添加标签

`Message.Footer` 里的操作按钮通常只有图标，需要为每个按钮加上 `aria-label`。

```svelte showLineNumbers
<Message.Footer>
  <Button variant="ghost" size="icon" aria-label="Copy">
    <CopyIcon />
  </Button>
</Message.Footer>
```

### 状态更新

对于正在进行的消息，使用带 `role="status"` 的 [`Marker`](/docs/components/marker)，辅助技术会在更新出现时播报。

```svelte showLineNumbers
<Message.Root>
  <Marker.Root role="status">
    <Marker.Icon>
      <Spinner />
    </Marker.Icon>
    <Marker.Content>Checking the logs...</Marker.Content>
  </Marker.Root>
</Message.Root>
```

## API 参考

### Message

消息行容器。

| 属性    | 类型               | 默认值    | 说明                               |
| ------- | ------------------ | --------- | ---------------------------------- |
| `align` | `"start" \| "end"` | `"start"` | 消息在对话中的对齐方式。           |
| `class` | `string`           | -         | 附加到消息行的类名。               |

### Message.Group

把同一发送者的连续消息归为一组。

| 属性    | 类型     | 默认值 | 说明                             |
| ------- | -------- | ------ | -------------------------------- |
| `class` | `string` | -      | 附加到分组根元素的类名。         |

### Message.Avatar

头像插槽，对齐到消息底部。消息带有 `Message.Footer` 时，头像会上移，与消息主体而非底部对齐。

| 属性    | 类型     | 默认值 | 说明                             |
| ------- | -------- | ------ | -------------------------------- |
| `class` | `string` | -      | 附加到头像插槽的类名。           |

### Message.Content

包裹头部、消息主体和底部。

| 属性    | 类型     | 默认值 | 说明                             |
| ------- | -------- | ------ | -------------------------------- |
| `class` | `string` | -      | 附加到内容插槽的类名。           |

### Message.Header

在消息上方显示内容，例如发送者名称。无论 `align` 取何值，始终对齐到起始位置。

| 属性    | 类型     | 默认值 | 说明                       |
| ------- | -------- | ------ | -------------------------- |
| `class` | `string` | -      | 附加到头部的类名。         |

### Message.Footer

在消息下方显示内容，例如状态或操作。跟随消息所在的一侧对齐。

| 属性    | 类型     | 默认值 | 说明                       |
| ------- | -------- | ------ | -------------------------- |
| `class` | `string` | -      | 附加到底部的类名。         |
