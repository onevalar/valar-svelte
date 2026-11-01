---
title: 对话
description: 整条对话线程。回复流式输出时，消息滚动容器守住阅读位置。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="chat-demo" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:pt-16 sm:pb-8 min-h-0">

<div></div>

</ComponentPreview>

对话是与智能体交流的完整线程。每一轮是[消息滚动容器](/docs/components/message-scroller)里的一个[消息](/docs/ai-elements/message)。用户的消息作为滚动锚点，新问题停下时靠近顶部，回复在其下方流式展开。输入区域是[提示词输入框](/docs/ai-elements/prompt-input)。

## 安装

对话基于[消息滚动容器](/docs/components/message-scroller)、[消息](/docs/components/message)、[气泡](/docs/components/bubble)和[输入框组](/docs/components/input-group)组件构建。

<PMAddComp name="message-scroller message bubble input-group" />

## 用法

```svelte showLineNumbers
<MessageScroller.Provider autoScroll>
  <MessageScroller.Root>
    <MessageScroller.Viewport>
      <MessageScroller.Content>
        <MessageScroller.Item messageId={id} scrollAnchor>
          <Message.Root align="end">
            <Message.Content>
              <Bubble.Root align="end" variant="muted">
                <Bubble.Content>{text}</Bubble.Content>
              </Bubble.Root>
            </Message.Content>
          </Message.Root>
        </MessageScroller.Item>
      </MessageScroller.Content>
    </MessageScroller.Viewport>
    <MessageScroller.Button />
  </MessageScroller.Root>
</MessageScroller.Provider>
```

`scrollAnchor` 加在用户这一轮上。用户停在实时边缘时，`autoScroll` 跟随回复。

详见[消息滚动容器](/docs/components/message-scroller)。

## AI SDK 辅助工具

没有模型时，用 `@shadcn/helpers/ai-sdk` 的 `createChat` 把对话写成脚本。智能体每一轮依次流式输出推理、工具调用和回复。`script.next()` 把下一段脚本消息填入输入框；脚本用完后，由字符串 `fallback` 给出回应。

```ts showLineNumbers
const script = createChat()
  .user("Add a dark mode toggle to the settings page.")
  .assistant(({ writer }) => {
    writer.reasoning("I need to know how themes are set up first.");
    writer
      .tool("runCommand", { input: { command: "rg -l ThemeProvider app" } })
      .output({ stdout: "app/layout.tsx" });
    writer.text("next-themes is already set up, so I added a ModeToggle.");
  });

const transport = script.transport({
  fallback:
    "This demo only knows the scripted turns. Press reset to start over.",
});

const chat = new Chat({ transport });
const nextMessage = $derived(script.next(chat.messages));
```
