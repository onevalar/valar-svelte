---
title: 消息
description: 一轮对话。用户的消息，以及智能体的回复与其操作。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="message-pattern" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

对话线程中的一轮用 `Message` 表示。用户的文本是[气泡](/docs/components/bubble)，放在设置 `align="end"` 的[消息](/docs/components/message)中。智能体的回复是渲染在 `Message` 上的 markdown，操作放在回复下方。这些轮次串起来就是[对话](/docs/ai-elements/chat)。

## 安装

`Message` 基于[消息](/docs/components/message)、[气泡](/docs/components/bubble)和[工具提示](/docs/components/tooltip)组件构建。

<PMAddComp name="message bubble tooltip" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import CopyIcon from "@lucide/svelte/icons/copy";
  import * as Bubble from "$lib/components/ui/bubble/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Message from "$lib/components/ui/message/index.js";
</script>
```

```svelte showLineNumbers
<Message.Root align="end">
  <Message.Content>
    <Bubble.Root align="end" variant="muted">
      <Bubble.Content>How do I add a settings dialog?</Bubble.Content>
    </Bubble.Root>
  </Message.Content>
</Message.Root>
<Message.Root>
  <Message.Content class="gap-2">
    <p>Install Dialog, then open it from the gear button.</p>
    <Message.Footer>
      <Button variant="ghost" size="icon-sm" aria-label="Copy">
        <CopyIcon />
      </Button>
    </Message.Footer>
  </Message.Content>
</Message.Root>
```

详见[消息](/docs/components/message)。

## 操作

操作放在 `Message.Footer` 中。底部跟随消息的对齐方式，因此用户这一轮的操作位于右侧。每个操作用幽灵样式的图标按钮，并配上工具提示。

- **复制**把回复写入剪贴板，图标换成对勾并保持两秒。
- **好评**和**差评**是切换按钮。设置 `aria-pressed`，屏幕阅读器才会播报当前状态。
- **重试**重新执行这一轮。
- 用户这一轮的**编辑**把消息文本放回输入框。

## Markdown

回复以 markdown 流式输出。用 [svelte-streamdown](https://github.com/beynar/svelte-streamdown) 渲染，并把围栏代码块交给[代码块](/docs/components/code-block#markdown)处理，回复中的代码就能带上行号和复制按钮。

## AI SDK

根据消息角色分支渲染。用户这一轮渲染为气泡，智能体这一轮渲染为回复；传入消息 id 调用 `chat.regenerate` 即可重新生成。

```svelte showLineNumbers
<script lang="ts">
  import { Chat } from "@ai-sdk/svelte";

  const chat = new Chat({});
</script>

{#each chat.messages as message (message.id)}
  {#if message.role === "user"}
    <Message.Root align="end">
      <Message.Content>
        <Bubble.Root align="end" variant="muted">
          <Bubble.Content>{getMessageText(message)}</Bubble.Content>
        </Bubble.Root>
      </Message.Content>
    </Message.Root>
  {:else}
    <Message.Root>
      <Message.Content class="gap-2">
        <Streamdown content={getMessageText(message)} />
        <Message.Footer>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Retry"
            onclick={() => chat.regenerate({ messageId: message.id })}
          >
            <RefreshCcwIcon />
          </Button>
        </Message.Footer>
      </Message.Content>
    </Message.Root>
  {/if}
{/each}
```
