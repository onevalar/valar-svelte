---
title: 任务
description: 显示智能体执行过程中的各个步骤。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="task-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

任务是智能体正在做的一件事，例如查找项目文件或更新页面。智能体每执行一个步骤，比如一次搜索、一次读取或一次编辑，该步骤就出现在任务下方。

任务基于 `Trace` 构建，每个任务对应一个 `Trace.Collapsible`。

## 任务与计划

两者都是可折叠行下面的步骤列表，区别在于步骤何时确定。

智能体在开始前就定好步骤时，用[计划](/docs/ai-elements/plan)；步骤来自工作本身，智能体做完一步才知道下一步时，用任务。

|                | 计划                          | 任务                           |
| -------------- | ----------------------------- | ------------------------------ |
| 步骤           | 开始时就列出全部步骤          | 每执行一步才增加一步           |
| 尚未开始的步骤 | 有，按顺序等待                | 没有                           |
| 标题           | 目标，附带进度：“2 of 4 done” | 智能体正在做什么，以及做完什么 |
| 每轮回复       | 一个计划                      | 一个或多个任务，完成后各自收起 |

## 安装

任务基于[调用链](/docs/components/trace)组件构建。

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
        <Trace.Title>Found the project files</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <Trace.Root>
        <Trace.Line>
          <Trace.Icon>
            <SearchIcon />
          </Trace.Icon>
          <Trace.Title>Searched for app/page.tsx</Trace.Title>
        </Trace.Line>
        <a href="/files/app/page.tsx">
          <Trace.Line>
            <Trace.Icon>
              <FileTextIcon />
            </Trace.Icon>
            <Trace.Title>Read app/page.tsx</Trace.Title>
          </Trace.Line>
        </a>
      </Trace.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 状态

根据步骤设置任务的状态。任务进行中时标题用现在时，完成后改用过去时。

| 步骤情况       | `status`    | 标题                               |
| -------------- | ----------- | ---------------------------------- |
| 有步骤仍在运行 | `"running"` | Updating the page metadata         |
| 有步骤失败     | `"error"`   | Failed to update the page metadata |
| 所有步骤完成   | 无          | Updated the page metadata          |

多个任务可以放在同一个 `Trace` 中。运行中的任务保持展开，任务完成后逐一收起。

## AI SDK

把每个任务作为带独立 `id` 的数据部分流式传输。AI SDK 会用相同 `id` 替换数据部分，所以带上新步骤重写任务时，它会在原位更新。

```ts showLineNumbers title="src/routes/api/chat/+server.ts"
const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    writer.write({ type: "data-task", id: "update", data: { title, steps } });
  },
});
```

```svelte showLineNumbers
{@const tasks = message.parts.filter((part) => part.type === "data-task")}
```

## API 参考

见[调用链](/docs/components/trace#api-参考)。
