---
title: 建议
description: 一次点击就能发给智能体的简短提示词。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="suggestion-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

建议是无需输入即可发送的提示词。每个建议都是一个[按钮](/docs/components/button)，提示词就是它的标签。把一排建议放在[提示词输入框](/docs/ai-elements/prompt-input)上方。

## 安装

建议基于[按钮](/docs/components/button)组件构建。

<PMAddComp name="button" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
</script>
```

```svelte showLineNumbers
<div
  class="scrollbar-none flex scroll-fade-x gap-2 overflow-x-auto overscroll-x-contain"
>
  {#each suggestions as suggestion, index (index)}
    <Button
      variant="outline"
      size="sm"
      class="shrink-0"
      onclick={() => send(suggestion)}
    >
      {suggestion}
    </Button>
  {/each}
</div>
```

## 滚动

建议超出可用宽度时，这一行横向滚动。[`scroll-fade-x`](/docs/utils/scroll-fade) 让还有内容的边缘淡出，`shrink-0` 让每个标签保持单行。

## AI SDK

标签就是消息内容，原样发送。

```ts showLineNumbers
chat.sendMessage({ text: suggestion });
```
