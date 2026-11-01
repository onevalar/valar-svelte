---
title: 行内引用
description: 嵌在句子里的来源，悬停时展开。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="inline-citation-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

行内引用是嵌在句子里的来源，为这句话提供出处。本质上是加在[按钮](/docs/components/button)上的[悬停卡片](/docs/components/hover-card)。

要在回复之后列出全部来源，改用[来源](/docs/ai-elements/sources)。

## 安装

行内引用基于[悬停卡片](/docs/components/hover-card)和[按钮](/docs/components/button)组件构建。

<PMAddComp name="hover-card button" />

## 用法

```svelte showLineNumbers
<HoverCard.Root openDelay={10} closeDelay={100}>
  <HoverCard.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="secondary" size="xs">
        {hostname}
      </Button>
    {/snippet}
  </HoverCard.Trigger>
  <HoverCard.Content class="flex w-64 flex-col gap-1">
    <div class="font-medium">{title}</div>
    <a href={url} target="_blank" rel="noreferrer">
      {hostname}
      <span class="sr-only"> (opens in a new tab)</span>
    </a>
  </HoverCard.Content>
</HoverCard.Root>
```

## AI SDK

引用本身是一个 `source-url` 部分。在 `toUIMessageStreamResponse()` 上设置 `sendSources: true`，或自行写入这个部分。

```ts showLineNumbers title="src/routes/api/chat/+server.ts"
writer.write({
  type: "source-url",
  sourceId: "valar",
  url: "http://127.0.0.1:5186/docs",
  title: "Valar Svelte",
});
```

```ts showLineNumbers
const sources = $derived(
  message.parts.filter((part) => part.type === "source-url")
);
```

`title` 可以省略。省略时回退到 URL 的主机名。
