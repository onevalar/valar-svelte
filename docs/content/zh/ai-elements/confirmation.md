---
title: 确认
description: 工具运行前征求用户同意。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="confirmation-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

确认组件在工具运行前向用户询问是否继续。问题本身是一个[列表项](/docs/components/item)，带 Deny 和 Approve 两个按钮。用户作答后，待审批的调用变回[工具调用](/docs/ai-elements/tool)行。

## 安装

确认基于[列表项](/docs/components/item)和[按钮](/docs/components/button)组件构建。

<PMAddComp name="item button" />

## 用法

```svelte showLineNumbers
<Item.Root variant="outline" size="sm">
  <Item.Media variant="icon">
    <TerminalIcon />
  </Item.Media>
  <Item.Content>
    <Item.Title>Run {part.input.command}?</Item.Title>
    <Item.Description>The command runs in this project.</Item.Description>
  </Item.Content>
  <Item.Actions>
    <Button size="sm" variant="outline" onclick={deny}>Deny</Button>
    <Button size="sm" onclick={approve}>Approve</Button>
  </Item.Actions>
</Item.Root>
```

## AI SDK

工具部分处于 `approval-requested` 状态时，用审批 id 作答。传入 `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses`，每个审批都有答复后，对话会继续。

```ts showLineNumbers
chat.addToolApprovalResponse({
  id: part.approval.id,
  approved: true,
});
```

```ts showLineNumbers
const chat = new Chat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
});
```

批准后流式输出工具结果，拒绝则流式输出 `output-denied`。无论批准还是拒绝，该部分都会变成工具调用行。

见[工具调用](/docs/ai-elements/tool#审批)。

## AI SDK 辅助函数

用 [`createChat`](/docs/ai-elements) 编写审批流程时，在工具上设置 `needsApproval`。批准后 `output` 才会流式输出，下一轮智能体读取 `toolCall.approved`。

```ts showLineNumbers
const chat = createChat()
  .user("Clean up the build folder.")
  .assistant(({ writer }) => {
    writer.tool("runCommand", {
      input: { command: "rm -rf dist" },
      needsApproval: true,
      output: { stdout: "" },
    });
  })
  .assistant(({ writer, toolCall }) => {
    writer.text(
      toolCall?.approved
        ? "Removed the dist folder."
        : "Okay, I left the dist folder in place."
    );
  });
```
