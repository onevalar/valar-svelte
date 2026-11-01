---
title: 子代理
description: 显示一次子代理运行，包含它的工具调用和结果。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="subagent-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

子代理是一行调用链，表示智能体交给子代理的工作。标题就是这次运行，例如“Ran the research agent”。展开后可看到子代理发起的工具调用，以及它查到的内容。

子代理基于 `Trace` 构建：运行本身用 `Trace.Collapsible`，它的工具调用用嵌套的 `Trace`。

## 安装

子代理基于[调用链](/docs/components/trace)、[代码块](/docs/components/code-block)和[徽标](/docs/components/badge)组件构建。

<PMAddComp name="trace code-block badge" />

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
        <Trace.Title>Ran the research agent</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent class="flex flex-col gap-3">
      <Trace.Root>
        <Trace.Line>
          <Trace.Icon>
            <CircleCheckIcon />
          </Trace.Icon>
          <Trace.Title>Ran grep -rn cacheKey scripts</Trace.Title>
        </Trace.Line>
      </Trace.Root>
      <p>The cache is keyed on the commit SHA.</p>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 运行中

子代理运行期间，该行设为 `status="running"`，内容显示到目前为止的工具调用。子代理结束后再补上结果。

<ComponentPreview name="subagent-running" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 详情

把交给子代理的任务放在内容顶部，模型和工具用[徽标](/docs/components/badge)列出。运行耗时放在标题之后的 `Trace.Description` 中。

<ComponentPreview name="subagent-details" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## AI SDK

在 AI SDK 中，子代理是一个工具：它的 `execute` 在流式过程中不断产出子代理的 `UIMessage`。把工具部分渲染成该行，把 `part.output.parts` 渲染成嵌套的 `Trace`。每个嵌套的工具部分按[工具调用](/docs/ai-elements/tool#状态)中的方式映射。

每次产出都是暂定输出：该部分为 `output-available`，并带 `preliminary: true`。最终输出会替换它，所以显示“Ran”之前先检查 `preliminary`。

| 工具部分状态                               | `Trace.Line` 状态              | 标题            |
| ------------------------------------------ | ------------------------------ | --------------- |
| `input-streaming`、`input-available`       | 对话流式输出期间为 `"running"` | Running …       |
| `output-available`，且 `preliminary: true` | 对话流式输出期间为 `"running"` | Running …       |
| `output-available`                         | 无                             | Ran …           |
| `output-error`，或对话停止后仍处于运行状态 | `"error"`                      | Failed to run … |

## API 参考

见[调用链](/docs/components/trace#api-参考)。
