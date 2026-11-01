---
title: 工具调用
description: 显示智能体发起的一次工具调用，从输入到输出。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="tool-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

`Tool` 表示智能体发起的一次工具调用，例如运行命令或读取文件。该行从输入到输出呈现整次调用，包括出错和等待审批的调用。

`Tool` 基于 `Trace` 构建，每次有输出的调用都使用一个 `Trace.Collapsible`。

## 安装

`Tool` 基于[调用链](/docs/components/trace)和[代码块](/docs/components/code-block)组件构建。

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
        <Trace.Title>Ran git status --short</Trace.Title>
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

## 状态

`Trace` 不读取工具部分。需要把每个部分的 `state` 映射为 `status` 和标题。

<ComponentPreview name="tool-states" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

| 工具部分的状态                                           | `status`                     | 标题                                                              |
| -------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `input-streaming`、`input-available`                      | 对话流式输出期间为 `"running"` | Running …                                                         |
| 对话停止后的 `input-streaming`、`input-available`          | `"error"`                    | Failed to run …                                                   |
| `approval-requested`                                      | -                            | 不是一行。在 `Trace` 外用 `Item` 展示，带 Approve 和 Deny 按钮。  |
| `approval-responded`                                      | 已批准为 `"running"`，否则无  | 已批准为 Running …，否则为 Denied …                                |
| `output-available`                                        | 无                           | Ran …                                                             |
| `output-error`                                            | `"error"`                    | Failed to run …                                                   |
| `output-denied`                                           | 无                           | Denied …                                                          |

工具调用在运行期间是普通的 `Trace.Line`，输出到达后变为 `Trace.Collapsible`。

```svelte showLineNumbers
{#snippet toolLine(part: ToolPart, streaming: boolean)}
  {@const command = part.input?.command}
  {#if part.state === "output-denied" || (part.state === "approval-responded" && !part.approval.approved)}
    <Trace.Line>
      <Trace.Icon>
        <TerminalIcon />
      </Trace.Icon>
      <Trace.Title>Denied {command}</Trace.Title>
    </Trace.Line>
  {:else if part.state === "output-available" || part.state === "output-error"}
    {@const failed = part.state === "output-error"}
    <Trace.Collapsible>
      <Trace.CollapsibleTrigger>
        <Trace.Line status={failed ? "error" : undefined}>
          <Trace.Icon>
            <TerminalIcon />
          </Trace.Icon>
          <Trace.Title>{failed ? "Failed to run" : "Ran"} {command}</Trace.Title>
        </Trace.Line>
      </Trace.CollapsibleTrigger>
      <Trace.CollapsibleContent>
        <CodeBlock.Root size="sm">
          <CodeBlock.Content
            wrap
            class="max-h-64"
            code={failed ? part.errorText : part.output.stdout}
          />
        </CodeBlock.Root>
      </Trace.CollapsibleContent>
    </Trace.Collapsible>
  {:else}
    <Trace.Line status={streaming ? "running" : "error"}>
      <Trace.Icon>
        <TerminalIcon />
      </Trace.Icon>
      <Trace.Title>{streaming ? "Running" : "Failed to run"} {command}</Trace.Title>
    </Trace.Line>
  {/if}
{/snippet}
```

```svelte showLineNumbers
<Trace.Root>
  {#each message.parts.filter((part) => part.type === "tool-runCommand") as part (part.toolCallId)}
    {@render toolLine(part, streaming)}
  {/each}
</Trace.Root>
```

在客户端运行的工具调用，对话停止后仍保持 `input-available`，直到调用 `addToolOutput`。此时应视为等待中，而不是失败。

## 在面板中展示输出

输出较长时，用 `Sheet.Trigger` 包裹 `Trace.Line`，在面板中打开输出。

<ComponentPreview name="tool-sheet" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

见[调用链](/docs/components/trace#对话框)。

## 审批

待处理的审批是向用户提出的问题，不是智能体执行的步骤，因此以 `Item` 的形式放在 `Trace` 外部。用户作答后，工具调用重新变回一行。见[确认](/docs/ai-elements/confirmation)。

<ComponentPreview name="tool-approval" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
{#if part.state === "approval-requested"}
  <Item.Root variant="outline" size="sm">
    <Item.Media variant="icon">
      <TerminalIcon />
    </Item.Media>
    <Item.Content>
      <Item.Title>Run {part.input.command}?</Item.Title>
    </Item.Content>
    <Item.Actions>
      <Button
        size="sm"
        variant="outline"
        onclick={() =>
          chat.addToolApprovalResponse({
            id: part.approval.id,
            approved: false,
          })}
      >
        Deny
      </Button>
      <Button
        size="sm"
        onclick={() =>
          chat.addToolApprovalResponse({
            id: part.approval.id,
            approved: true,
          })}
      >
        Approve
      </Button>
    </Item.Actions>
  </Item.Root>
{/if}
```

给 `new Chat()` 传入 `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses`，每个审批都有答复后，对话会继续。

## API 参考

见[调用链](/docs/components/trace#api-参考)。
