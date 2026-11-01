---
title: 思维链
description: 显示一行摘要，展开后是智能体执行的各个步骤。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="chain-of-thought-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

思维链是一行摘要，展开后显示智能体执行的各个步骤。摘要概括发生了什么，例如“Researched in 3 steps”。步骤位于摘要内部，每个步骤单独占一行。

思维链基于 `Trace` 构建，摘要部分使用一个 `Trace.Collapsible`。

## 安装

思维链基于[调用链](/docs/components/trace)、[代码块](/docs/components/code-block)和[徽标](/docs/components/badge)组件构建。

<PMAddComp name="trace code-block badge" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as Trace from "$lib/components/ui/trace/index.js";
</script>
```

```svelte showLineNumbers
<Trace.Root>
  <Trace.Collapsible open>
    <Trace.CollapsibleTrigger>
      <Trace.Line>
        <Trace.Icon>
          <CircleCheckIcon />
        </Trace.Icon>
        <Trace.Title>Researched in 3 steps</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <Trace.Root>
        <Trace.Line>
          <Trace.Icon>
            <CircleCheckIcon />
          </Trace.Icon>
          <Trace.Title>Read the build log for dpl_8Kx2</Trace.Title>
        </Trace.Line>
        <Trace.Line>
          <Trace.Icon>
            <CircleCheckIcon />
          </Trace.Icon>
          <Trace.Title
            >Searched the web for next.js image cache key</Trace.Title
          >
        </Trace.Line>
        <Trace.Line>
          <Trace.Icon>
            <CircleCheckIcon />
          </Trace.Icon>
          <Trace.Title>Searched the code for cacheKey</Trace.Title>
        </Trace.Line>
      </Trace.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 步骤

每个步骤都是一个 `Trace.Line`。设置它的 `status`，并用对应的时态写标题。

| 步骤             | `status`    | 标题                          |
| ---------------- | ----------- | ----------------------------- |
| 运行中           | `"running"` | Searching for …               |
| 已完成，带细节   | 无          | Searched for …                |
| 已完成，外链     | 无          | Read the Image component docs |
| 失败             | `"error"`   | Failed to search for …        |

## 搜索结果

步骤执行网页搜索时，在步骤内容中为每个主机名显示一个 `Badge`。

```svelte showLineNumbers
<Trace.CollapsibleContent class="flex flex-wrap gap-1.5">
  {#each results as result, index (index)}
    <Badge variant="secondary">
      {new URL(result.url).hostname}
    </Badge>
  {/each}
</Trace.CollapsibleContent>
```

## AI SDK

把每个工具部分渲染为一个步骤。工具部分流式输出期间、回复开始之前，`running` 为 true。摘要的状态和标题由各个步骤决定。步骤运行期间摘要保持展开，见[调用链](/docs/components/trace#展开状态)。

```svelte showLineNumbers
<script lang="ts">
  let open = $state<boolean>();
  const running = $derived(streaming && !answering);
  const failed = $derived(
    steps.filter((part) => part.state === "output-error").length
  );
</script>

<Trace.Collapsible
  open={open ?? running}
  onOpenChange={(value) => (open = value)}
>
  <Trace.CollapsibleTrigger>
    <Trace.Line
      status={running ? "running" : failed > 0 ? "error" : undefined}
    >
      <Trace.Title>
        {running ? "Researching" : `Researched in ${steps.length} steps`}
      </Trace.Title>
    </Trace.Line>
  </Trace.CollapsibleTrigger>
  <Trace.CollapsibleContent>
    <Trace.Root>
      {#each steps as part (part.toolCallId)}
        {@render stepLine(part, streaming)}
      {/each}
    </Trace.Root>
  </Trace.CollapsibleContent>
</Trace.Collapsible>
```

`stepLine` 把一个工具部分渲染为 `Trace.Line`，见[工具调用](/docs/ai-elements/tool#状态)。

## API 参考

见[调用链](/docs/components/trace#api-参考)。
