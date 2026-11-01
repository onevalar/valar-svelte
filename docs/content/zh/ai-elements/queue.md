---
title: 队列
description: 显示智能体的待办清单，分为未完成和已完成两部分。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="queue-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

队列是智能体的待办清单。待办分为未完成和已完成两个分区，每条待办的图标表示它的状态。智能体边工作边更新清单，某项完成后就从一侧移到另一侧。

队列基于 `Trace` 构建，每个分区对应一个 `Trace.Collapsible`。

## 安装

队列基于[调用链](/docs/components/trace)组件构建。

<PMAddComp name="trace" />

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
          <ListTodoIcon />
        </Trace.Icon>
        <Trace.Title>2 to do</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <Trace.Root>
        <Trace.Line>
          <Trace.Icon>
            <CircleIcon />
          </Trace.Icon>
          <Trace.Title>Update the registry snapshots</Trace.Title>
        </Trace.Line>
        <Trace.Line>
          <Trace.Icon>
            <CircleIcon />
          </Trace.Icon>
          <Trace.Title>Add tests for the combobox</Trace.Title>
        </Trace.Line>
      </Trace.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
  <Trace.Collapsible>
    <Trace.CollapsibleTrigger>
      <Trace.Line>
        <Trace.Icon>
          <ListChecksIcon />
        </Trace.Icon>
        <Trace.Title>1 completed</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <Trace.Root>
        <Trace.Line>
          <Trace.Icon>
            <CircleCheckIcon />
          </Trace.Icon>
          <Trace.Title>Add a changeset</Trace.Title>
        </Trace.Line>
      </Trace.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 描述

带描述的待办用 `Trace.Collapsible`，展开后显示描述；没有描述的待办保持为 `Trace.Line`。

<ComponentPreview name="queue-descriptions" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<Trace.Collapsible>
  <Trace.CollapsibleTrigger>
    <Trace.Line>
      <Trace.Icon>
        <CircleIcon />
      </Trace.Icon>
      <Trace.Title>Fix the focus ring on the select trigger</Trace.Title>
    </Trace.Line>
  </Trace.CollapsibleTrigger>
  <Trace.CollapsibleContent>
    It is clipped by overflow-hidden on the field.
  </Trace.CollapsibleContent>
</Trace.Collapsible>
```

## AI SDK

智能体通过工具写入待办，示例中用的是 `writeTodos`。每次调用都会发送整份清单，所以只渲染最后一次调用，输入仍在流式传输的调用跳过。

```svelte showLineNumbers
{@const todos = message.parts
  .filter((part) => part.type === "tool-writeTodos")
  .filter((part) => part.state !== "input-streaming")
  .at(-1)?.input?.todos}
```

把每种待办状态映射到分区、图标和 `Trace.Line` 的状态。只在对话流式输出期间给进行中的待办设置 `"running"`，智能体停止后标题的微光随之消失。

| 待办状态      | 分区   | 图标              | `Trace.Line` 状态              |
| ------------- | ------ | ----------------- | ------------------------------ |
| `pending`     | 未完成 | `CircleIcon`      | 无                             |
| `in_progress` | 未完成 | `CircleDotIcon`   | 对话流式输出期间为 `"running"` |
| `completed`   | 已完成 | `CircleCheckIcon` | 无                             |

## API 参考

见[调用链](/docs/components/trace#api-参考)。
