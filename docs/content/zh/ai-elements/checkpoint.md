---
title: 检查点
description: 标记对话中可以返回的位置。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="checkpoint-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

检查点是对话中可以返回的位置。它是一轮对话之后的[标记](/docs/components/marker)，带一个 Restore 按钮。恢复会保留该轮对话，删除其后的所有消息。

## 安装

检查点基于[标记](/docs/components/marker)和[按钮](/docs/components/button)组件构建。

<PMAddComp name="marker button" />

## 用法

在该轮对话之后渲染标记，并附一个用于恢复的按钮。

```svelte showLineNumbers
<Marker.Root variant="separator">
  <Marker.Content class="inline-flex items-center gap-2">
    {label}
    <Button size="xs" variant="outline" onclick={restore}>Restore</Button>
  </Marker.Content>
</Marker.Root>
```

见[标记](/docs/components/marker#分隔线)。

## AI SDK

恢复会用截至该轮（含该轮）的消息替换整个线程，其后的每一轮都会被删除。要从此处继续，发送一条新消息。

```ts showLineNumbers
const index = chat.messages.findIndex((message) => message.id === messageId);
chat.messages = chat.messages.slice(0, index + 1);
```

## AI SDK 辅助函数

用 [`createChat`](/docs/ai-elements) 编排检查点时，把它写成智能体该轮的一个数据部分。只有确实要更新该检查点时，才再次发送同一个 `id`。

```ts showLineNumbers
const chat = createChat()
  .user("Rename the button component to action.")
  .assistant(({ writer }) => {
    writer.text("Renamed Button to Action in components/ui/button.tsx.");
    writer.data({
      type: "data-checkpoint",
      id: "rename",
      data: { label: "Button renamed" },
    });
  })
  .user("Update the docs to match.")
  .assistant(({ writer }) => {
    writer.text("Updated the Button page to say Action.");
  });
```
