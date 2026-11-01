---
title: 终端
description: 显示智能体运行的命令，并随运行流式展示其输出。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="terminal-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

终端表示智能体运行的一条 shell 命令，例如代码检查、测试或构建。该行显示命令本身，运行期间输出在下方流式呈现。

终端基于 `Trace` 构建，每条命令对应一个 `Trace.Collapsible`。

## 安装

终端基于[调用链](/docs/components/trace)和[代码块](/docs/components/code-block)组件构建。

<PMAddComp name="trace code-block" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as CodeBlock from "$lib/components/ui/code-block/index.js";
  import * as Trace from "$lib/components/ui/trace/index.js";
</script>
```

```svelte showLineNumbers
<Trace.Root>
  <Trace.Collapsible>
    <Trace.CollapsibleTrigger>
      <Trace.Line>
        <Trace.Icon>
          <TerminalIcon />
        </Trace.Icon>
        <Trace.Title>Ran pnpm build</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <CodeBlock.Root size="sm">
        <CodeBlock.Content wrap class="max-h-64" code={output} />
      </CodeBlock.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 退出码

命令以 `0` 以外的任何退出码结束都算失败。此时设置 `status="error"`。

<ComponentPreview name="terminal-error" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

| 命令                       | `status`    | 标题                         |
| -------------------------- | ----------- | ---------------------------- |
| 运行中                     | `"running"` | Running pnpm build           |
| 退出码为 `0`               | 无          | Ran pnpm build               |
| 以其他退出码结束           | `"error"`   | pnpm lint exited with code 1 |

命令本身就是一次工具调用，状态映射方式与[工具调用](/docs/ai-elements/tool#状态)一致。

## 运行期间展开

第一批输出到达后就展开该行，命令运行期间即可看到输出。之后再保持展开或收起，做法同[调用链](/docs/components/trace#展开状态)。

## AI SDK

工具结果要等命令退出后才返回。要在运行期间流式输出，就在工具里把它写成数据部分，并带上该工具调用的 id。AI SDK 会替换 id 相同的数据部分，输出因此原地增长。

```ts showLineNumbers
writer.write({
  type: "data-terminal",
  id: toolCallId,
  data: { output },
});
```

在客户端，找到与每个工具部分对应的数据部分。

```ts showLineNumbers
function getOutput(message: ChatMessage, toolCallId: string) {
  for (const part of message.parts) {
    if (part.type === "data-terminal" && part.id === toolCallId) {
      return part.data.output;
    }
  }

  return "";
}
```

## API 参考

见[调用链](/docs/components/trace#api-参考)。
