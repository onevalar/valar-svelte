---
title: 计划
description: 显示智能体计划执行的步骤，以及当前进度。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="plan-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

计划是智能体开始前定好的步骤清单，比如一次迁移的各个步骤。每个步骤处于已完成、进行中或待处理状态，标题会显示已完成的数量。

计划基于 `Trace` 构建，整个计划对应一个 `Trace.Collapsible`。

步骤无法预先确定时，改用[任务](/docs/ai-elements/task#任务与计划)。

## 安装

计划基于[调用链](/docs/components/trace)组件构建。

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
      <Trace.Line status="running">
        <Trace.Icon>
          <RouteIcon />
        </Trace.Icon>
        <Trace.Title>Plan: migrate to Base UI</Trace.Title>
        <Trace.Description>2 of 5 done</Trace.Description>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <Trace.Root>
        <Trace.Line>
          <Trace.Icon>
            <CircleCheckIcon />
          </Trace.Icon>
          <Trace.Title>Replace the Radix imports</Trace.Title>
        </Trace.Line>
        <Trace.Line status="running">
          <Trace.Icon>
            <CircleDotIcon />
          </Trace.Icon>
          <Trace.Title>Rename asChild to render</Trace.Title>
        </Trace.Line>
        <Trace.Line status="pending">
          <Trace.Icon>
            <CircleIcon />
          </Trace.Icon>
          <Trace.Title>Run the type checker</Trace.Title>
        </Trace.Line>
      </Trace.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 详情

在 `Trace.CollapsibleContent` 内、步骤上方放置说明文字。

<ComponentPreview name="plan-description" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## AI SDK

把计划作为带固定 `id` 的数据部分流式传输。AI SDK 会用相同的 `id` 替换数据部分，因此它会在原位更新。

```ts showLineNumbers title="src/routes/api/chat/+server.ts"
const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    writer.write({ type: "data-plan", id: "plan", data: { title, steps } });
  },
});
```

```svelte showLineNumbers
{@const plan = message.parts.find((part) => part.type === "data-plan")}
```

## API 参考

见[调用链](/docs/components/trace#api-参考)。
