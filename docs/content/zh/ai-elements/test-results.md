---
title: 测试结果
description: 显示智能体执行的一次测试，包含测试套件和失败项。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="test-results-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

测试结果表示智能体执行的一次测试。摘要行统计通过与失败的数量。展开后显示各个测试套件、其中的测试，以及每个失败项的错误。

测试结果基于 `Trace` 构建，整次运行和每个测试套件各使用一个 `Trace.Collapsible`。

## 安装

测试结果基于[调用链](/docs/components/trace)和[代码块](/docs/components/code-block)组件构建。

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
      <Trace.Line status="error">
        <Trace.Icon>
          <FlaskConicalIcon />
        </Trace.Icon>
        <Trace.Title>Ran 2 tests, 1 failed</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>
      <Trace.Root>
        <Trace.Line>
          <Trace.Icon>
            <CheckIcon />
          </Trace.Icon>
          <Trace.Title>creates a user</Trace.Title>
        </Trace.Line>
        <Trace.Collapsible>
          <Trace.CollapsibleTrigger>
            <Trace.Line status="error">
              <Trace.Icon>
                <XIcon />
              </Trace.Icon>
              <Trace.Title>updates a user profile</Trace.Title>
            </Trace.Line>
          </Trace.CollapsibleTrigger>
          <Trace.CollapsibleContent>
            <CodeBlock.Root size="sm">
              <CodeBlock.Content
                wrap
                class="max-h-64"
                code="Expected status 200, received 500"
              />
            </CodeBlock.Root>
          </Trace.CollapsibleContent>
        </Trace.Collapsible>
      </Trace.Root>
    </Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 测试套件

按文件分组测试。每个套件是一个可折叠行，内部用一个 `Trace` 列出其中的测试。有失败的套件要展开。

<ComponentPreview name="test-results-suites" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<Trace.Collapsible open={failed > 0}>
  <Trace.CollapsibleTrigger>
    <Trace.Line status={failed > 0 ? "error" : undefined}>
      <Trace.Icon>
        <FileCodeIcon />
      </Trace.Icon>
      <Trace.Title>user-api.test.ts, 14 tests, 2 failed</Trace.Title>
    </Trace.Line>
  </Trace.CollapsibleTrigger>
  <Trace.CollapsibleContent>
    <Trace.Root>…</Trace.Root>
  </Trace.CollapsibleContent>
</Trace.Collapsible>
```

## AI SDK

把测试作为工具运行，再渲染它的输出。工具状态的映射方式与[工具调用](/docs/ai-elements/tool#状态)相同。

```svelte showLineNumbers
{@const tests = part.output.suites.flatMap((suite) => suite.tests)}
{@const failed = tests.filter((test) => test.status === "failed").length}
<Trace.Collapsible open={untrack(() => failed > 0)}>
  <Trace.CollapsibleTrigger>
    <Trace.Line status={failed > 0 ? "error" : undefined}>
      <Trace.Icon>
        <FlaskConicalIcon />
      </Trace.Icon>
      <Trace.Title>
        Ran {tests.length} tests{failed > 0 ? `, ${failed} failed` : ""}
      </Trace.Title>
    </Trace.Line>
  </Trace.CollapsibleTrigger>
  <Trace.CollapsibleContent>…</Trace.CollapsibleContent>
</Trace.Collapsible>
```

## API 参考

见[调用链](/docs/components/trace#api-参考)。
