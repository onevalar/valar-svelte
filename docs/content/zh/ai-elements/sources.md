---
title: 来源
description: 显示智能体在回复中引用的链接。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="sources-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

来源把智能体在回复中引用的链接收成一行。行首说明数量，例如“Used 3 sources”，展开后逐条列出链接。

来源基于 `Trace` 构建，列表部分用 `Trace.Collapsible`。

## 安装

来源基于[调用链](/docs/components/trace)组件构建。

<PMAddComp name="trace" />

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
          <GlobeIcon />
        </Trace.Icon>
        <Trace.Title>Used {sources.length} sources</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <Trace.Root>
        {#each sources as source (source.sourceId)}
          <a href={source.url} target="_blank" rel="noreferrer">
            <Trace.Line>
              <Trace.Icon>
                <GlobeIcon />
              </Trace.Icon>
              <Trace.Title>
                {source.title ?? new URL(source.url).hostname}
                <span class="sr-only"> (opens in a new tab)</span>
              </Trace.Title>
              <Trace.Icon>
                <ArrowUpRightIcon />
              </Trace.Icon>
            </Trace.Line>
          </a>
        {/each}
      </Trace.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## AI SDK

收集消息里的 `source-url` 部分，渲染在文本之后。智能体可能多次引用同一页面，需要按 `url` 去重。

```ts showLineNumbers
const sources = $derived(
  message.parts
    .filter((part) => part.type === "source-url")
    .filter(
      (part, index, all) =>
        all.findIndex((other) => other.url === part.url) === index
    )
);
```

`source-url` 部分的 `title` 可省略。省略时回退到 URL 的主机名。

## 无障碍

每条来源都是列表里的普通链接。

- 链接在新标签页打开。加上 `sr-only` 文本，例如“(opens in a new tab)”，屏幕阅读器才会播报。
- 箭头图标只作装饰，链接名称由标题承担。
- 触发器里的数量，例如“Used 3 sources”，在展开之前就说明了将要出现的内容。

## API 参考

见[调用链](/docs/components/trace#api-参考)。
