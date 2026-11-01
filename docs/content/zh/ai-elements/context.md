---
title: 上下文
description: 对话已占用的上下文窗口比例。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="context-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

上下文组件显示对话已占用模型上下文窗口的比例，由[悬停卡片](/docs/components/hover-card)和[进度条](/docs/components/progress)组成。

## 安装

上下文组件基于[悬停卡片](/docs/components/hover-card)和[进度条](/docs/components/progress)构建。

<PMAddComp name="hover-card progress button" />

## 用法

```svelte showLineNumbers
<HoverCard.Root openDelay={10} closeDelay={100}>
  <HoverCard.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" size="sm">
        {percent}% context
      </Button>
    {/snippet}
  </HoverCard.Trigger>
  <HoverCard.Content class="flex w-64 flex-col gap-3">
    <div class="flex items-center justify-between gap-3 text-sm">
      <span class="font-medium">Context</span>
      <span class="text-muted-foreground">
        {used} / {limit}
      </span>
    </div>
    <Progress value={percent} aria-label="Context used" />
  </HoverCard.Content>
</HoverCard.Root>
```

## AI SDK

从智能体消息的元数据中读取用量。`messageMetadata` 在流结束时执行。

```ts showLineNumbers title="src/routes/api/chat/+server.ts"
return result.toUIMessageStreamResponse({
  messageMetadata: ({ part }) => {
    if (part.type === "finish") {
      return { usage: part.totalUsage };
    }
  },
});
```

```ts showLineNumbers
const usage = $derived(message.metadata?.usage);
const used = $derived((usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0));
const percent = $derived(Math.round((used / limit) * 100));
```

`limit` 是模型的上下文窗口大小。AI SDK 不会返回该值，需要按所用模型自行设置。
