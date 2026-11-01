---
title: 推理
description: 流式展示智能体的思考过程。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="reasoning-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

推理把智能体的思考过程呈现为一行文字。模型思考时该行显示“Thinking”并展开，结束后改为“Thought”并收起。思考内容位于该行内部，行上还可以显示耗时。

推理基于 `Trace` 构建，思考内容使用一个 `Trace.Collapsible`。

## 安装

推理基于[调用链](/docs/components/trace)组件构建。

<PMAddComp name="trace" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as Trace from "$lib/components/ui/trace/index.js";
</script>
```

```svelte showLineNumbers
<Trace.Root>
  <Trace.Collapsible>
    <Trace.CollapsibleTrigger>
      <Trace.Line>
        <Trace.Icon>
          <CircleCheckIcon />
        </Trace.Icon>
        <Trace.Title>Thought</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent class="whitespace-pre-wrap">
      {text}
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 时长

AI SDK 不统计推理耗时。在服务端计时，作为消息元数据发出，再在标题后用 `Trace.Description` 显示。

<ComponentPreview name="reasoning-duration" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<Trace.Line>
  <Trace.Icon>
    <CircleCheckIcon />
  </Trace.Icon>
  <Trace.Title>Thought</Trace.Title>
  <Trace.Description>{seconds}s</Trace.Description>
</Trace.Line>
```

## AI SDK

把每个 `reasoning` 部分渲染为一行。它最初是普通的 `Trace.Line`，文本到达后才变成 `Trace.Collapsible`，所以模型还没动笔时这一行不可展开。模型思考期间展开，结束后收起。用户手动展开或收起后，以用户的选择为准。见[调用链](/docs/components/trace#展开状态)。

```svelte showLineNumbers
<script lang="ts">
  // The person's choice for each line. Until they click, it follows `running`.
  let reasoningOpen = $state<Record<string, boolean>>({});
</script>

{#snippet reasoningLine(id: string, text: string, running: boolean)}
  {#snippet line()}
    <Trace.Line status={running ? "running" : undefined}>
      <Trace.Icon>
        {#if running}
          <LoaderCircleIcon class="animate-spin" />
        {:else}
          <CircleCheckIcon />
        {/if}
      </Trace.Icon>
      <Trace.Title>{running ? "Thinking" : "Thought"}</Trace.Title>
    </Trace.Line>
  {/snippet}
  {#if text.length === 0}
    {@render line()}
  {:else}
    <Trace.Collapsible
      open={reasoningOpen[id] ?? running}
      onOpenChange={(open) => (reasoningOpen[id] = open)}
    >
      <Trace.CollapsibleTrigger>{@render line()}</Trace.CollapsibleTrigger>
      <Trace.CollapsibleContent class="whitespace-pre-wrap">
        {text}
      </Trace.CollapsibleContent>
    </Trace.Collapsible>
  {/if}
{/snippet}
```

```svelte showLineNumbers
<Trace.Root>
  {#each message.parts.filter((part) => part.type === "reasoning") as part, index (index)}
    {@render reasoningLine(
      `${message.id}-${index}`,
      part.text,
      streaming && part.state === "streaming"
    )}
  {/each}
</Trace.Root>
```

有些模型会在一条消息中发送多个推理部分，每个部分都是同一个 `Trace` 中的一行。

## API 参考

见[调用链](/docs/components/trace#api-参考)。
