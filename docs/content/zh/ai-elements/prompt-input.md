---
title: 提示词输入框
description: 带附件和发送按钮的消息输入框。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="prompt-input-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

提示词输入框是人向智能体发送消息的输入区域。它本身是一个[输入框组](/docs/components/input-group)，内含多行输入框、附件按钮、[模型选择器](/docs/ai-elements/model-selector)菜单和发送按钮。已附加的文件以[附件](/docs/components/attachment)标签的形式显示在输入文字上方。

## 安装

提示词输入框基于[输入框组](/docs/components/input-group)、[附件](/docs/components/attachment)和[下拉菜单](/docs/components/dropdown-menu)组件构建。

<PMAddComp name="input-group attachment dropdown-menu" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
</script>
```

```svelte showLineNumbers
<form bind:this={form} onsubmit={onSubmit}>
  <InputGroup.Root>
    <InputGroup.Textarea
      bind:value={text}
      placeholder="Ask the agent to change your code..."
      class="p-3"
    />
    <InputGroup.Addon align="block-end">
      <InputGroup.Button
        size="icon-sm"
        variant="outline"
        class="rounded-full"
        aria-label="Attach files"
        onclick={() => input?.click()}
      >
        <PlusIcon />
      </InputGroup.Button>
      <InputGroup.Button
        type="submit"
        size="icon-sm"
        variant="default"
        class="ml-auto rounded-full"
        disabled={!canSend}
        aria-label="Send"
      >
        <ArrowUpIcon />
      </InputGroup.Button>
    </InputGroup.Addon>
  </InputGroup.Root>
</form>
```

## 附件

附件按钮会打开隐藏的文件输入框。在 `align="block-start"` 的附加项中，用[附件](/docs/components/attachment)逐个展示已选文件，并配一个移除按钮。

## 模型与思考强度

把两个[模型选择器](/docs/ai-elements/model-selector)菜单放进 `block-end` 附加项，位于附件按钮和发送按钮之间。把发送按钮上的 `ml-auto` 移到第一个菜单的触发器上，两个菜单就会紧挨发送按钮。

## 键盘

按 Enter 发送消息，按 Shift+Enter 换行。

```svelte showLineNumbers
onkeydown={(event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form?.requestSubmit();
  }
}}
```

## AI SDK

发送文本，以及文件输入框的 `FileList`。

```ts showLineNumbers
chat.sendMessage({ text, files });
```

路由用 `result.toUIMessageStreamResponse()` 流式返回回复。
