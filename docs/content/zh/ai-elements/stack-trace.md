---
title: 堆栈跟踪
description: 显示失败的工具调用及其栈帧。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="stack-trace-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

堆栈跟踪表示一次失败的工具调用。标题就是错误信息，例如“Failed: TypeError”。展开后显示各栈帧，每个栈帧可以链接到对应的文件和行号。

堆栈跟踪基于 `Trace` 构建，栈帧使用一个 `Trace.Collapsible`。

## 安装

堆栈跟踪基于[调用链](/docs/components/trace)和[代码块](/docs/components/code-block)组件构建。

<PMAddComp name="trace code-block" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as Trace from "$lib/components/ui/trace/index.js";

  const [error, ...frames] = stack.split("\n").map((line) => line.trim());
</script>
```

```svelte showLineNumbers
<Trace.Root>
  <Trace.Collapsible>
    <Trace.CollapsibleTrigger>
      <Trace.Line status="error">
        <Trace.Icon>
          <CircleXIcon />
        </Trace.Icon>
        <Trace.Title>Failed: {error}</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <div
        class="flex flex-col gap-2 rounded-md bg-muted p-3 font-mono text-xs"
      >
        <p class="text-destructive">{error}</p>
        <ol>
          {#each frames as frame, index (index)}
            <li
              class={frame.includes("node_modules")
                ? undefined
                : "text-foreground"}
            >
              {frame}
            </li>
          {/each}
        </ol>
      </div>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

标题会被截断，因此在内容顶部再写一遍完整错误。来自 `node_modules` 的栈帧保持弱化显示，自己的栈帧因此更醒目。

## 栈帧链接

把自己的栈帧做成链接，点击后打开文件并定位到对应行。框架的栈帧收进单独的可折叠行，可以自行修复的栈帧因此排在前面。

<ComponentPreview name="stack-trace-frames" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## AI SDK

工具抛出异常时，它的部分是 `output-error`。默认 `errorText` 只有错误信息，不含栈帧。在 `toUIMessageStreamResponse` 的 `onError` 中返回 `error.stack`，栈帧才会一并发出。

```ts showLineNumbers title="src/routes/api/chat/+server.ts"
return result.toUIMessageStreamResponse({
  onError: (error) =>
    error instanceof Error ? (error.stack ?? error.message) : String(error),
});
```

堆栈会暴露服务端的文件路径，因此只在开发环境发送。

```svelte showLineNumbers
{#if part.state === "output-error"}
  {@const [error, ...frames] = part.errorText
    .split("\n")
    .map((line) => line.trim())}
  <Trace.Collapsible>…</Trace.Collapsible>
{/if}
```

其他工具状态的映射方式与[工具调用](/docs/ai-elements/tool#状态)相同。

## API 参考

见[调用链](/docs/components/trace#api-参考)。
