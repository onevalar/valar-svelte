---
title: 调用链
description: 推理、工具调用、来源等内容的构建单元。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/trace
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="trace-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

`Trace` 由若干行组成。每行包含一个图标、一个标题，以及可选的描述和状态。一行可以展开显示更多细节、跳转到页面，或打开对话框、面板。

每行的结构都相同，因此基于 `Trace` 构建的推理、工具调用、来源和计划，外观与行为保持一致。

智能体执行的步骤用 `Trace` 表示，例如调用工具、运行子代理或编辑文件。回复用[消息](/docs/components/message)，轮次之间的注释和分隔用[标记](/docs/components/marker)。

## 基于调用链构建

下列模式都由 `Trace` 的各个部件组合而成。示例和代码见 [AI 元素](/docs/ai-elements)。

| 模式       | 展示内容                                     |
| ---------- | -------------------------------------------- |
| [思维链](/docs/ai-elements/chain-of-thought) | 展开后显示背后步骤的摘要。                   |
| [计划](/docs/ai-elements/plan)               | 智能体计划执行的步骤，以及当前进度。         |
| [队列](/docs/ai-elements/queue)              | 智能体的待办清单，分为未完成和已完成。       |
| [推理](/docs/ai-elements/reasoning)          | 智能体实时输出的思考过程。                   |
| [来源](/docs/ai-elements/sources)            | 智能体生成回复时用到的链接。                 |
| [堆栈跟踪](/docs/ai-elements/stack-trace)    | 失败的工具调用及其栈帧。                     |
| [子代理](/docs/ai-elements/subagent)         | 一次子代理运行，包含它的工具调用和结果。     |
| [任务](/docs/ai-elements/task)               | 智能体执行过程中的步骤。                     |
| [终端](/docs/ai-elements/terminal)           | 智能体运行的命令及其实时输出。               |
| [测试结果](/docs/ai-elements/test-results)   | 智能体执行的一次测试，包含测试套件和失败项。 |
| [工具调用](/docs/ai-elements/tool)           | 智能体发起的一次工具调用，从输入到输出。     |

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="trace" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 Valar Svelte 所需的依赖：

</Step>

<PMAddComp name="collapsible" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## 用法

单个步骤用 `Trace.Line`：

```svelte showLineNumbers
<script lang="ts">
  import * as Trace from "$lib/components/ui/trace/index.js";
</script>
```

```svelte showLineNumbers
<Trace.Root>
  <Trace.Line>
    <Trace.Icon>
      <SearchIcon />
    </Trace.Icon>
    <Trace.Title>Searched for minimumReleaseAge</Trace.Title>
  </Trace.Line>
</Trace.Root>
```

用 `Trace.Collapsible` 包裹该行，展开时即显示更多细节：

```svelte showLineNumbers
<Trace.Root>
  <Trace.Collapsible>
    <Trace.CollapsibleTrigger>
      <Trace.Line>
        <Trace.Icon>
          <TerminalIcon />
        </Trace.Icon>
        <Trace.Title>Ran node --version</Trace.Title>
      </Trace.Line>
    </Trace.CollapsibleTrigger>
    <Trace.CollapsibleContent>v24.18.0</Trace.CollapsibleContent>
  </Trace.Collapsible>
</Trace.Root>
```

## 组合

一行调用链按以下结构组合：

```text
Trace.Root
└── Trace.Line
    ├── Trace.Icon
    ├── Trace.Title
    ├── Trace.Description
    └── Trace.Icon
```

用 `Trace.Collapsible` 包裹该行，展开时即显示更多细节：

```text
Trace.Root
└── Trace.Collapsible
    ├── Trace.CollapsibleTrigger
    │   └── Trace.Line
    └── Trace.CollapsibleContent
```

`Trace.Line` 始终表示行本身。要让一行触发某个行为，就用该行为的触发器包裹它。

## 特性

- 推理、工具调用、来源、计划和任务共用同一种行
- 行可展开、可外链，也可打开对话框、面板、抽屉或弹出层
- 支持 `running`、`error` 和 `pending` 状态，运行中带微光效果
- 支持嵌套：摘要展开为步骤，步骤展开为输出
- 键盘和屏幕阅读器支持由包裹每行的触发器提供
- 每个部件都通过 `class` 属性支持自定义样式

## 调用链条目

没有细节可展示的步骤，单独使用 `Trace.Line`。读起来就是一段纯文本。

<ComponentPreview name="trace-static" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 状态

步骤正在运行、已经失败或尚未开始时，在 `Trace.Line` 上设置 `status`。

<ComponentPreview name="trace-status" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

| 状态        | 适用场景                                                     |
| ----------- | ------------------------------------------------------------ |
| 无          | 已完成的工作：“Ran pnpm install”。                            |
| `"error"`   | 失败的工作。在标题中说明：“Failed to run pnpm lint”。         |
| `"running"` | 进行中的工作。标题用进行时表述：“Running pnpm build”。        |
| `"pending"` | 尚未开始的工作，例如计划中的步骤：“Run pnpm test”。           |

## 描述

差异统计、耗时或计数等次要信息，放在 `Trace.Title` 之后的 `Trace.Description` 中。这部分不会截断。

<ComponentPreview name="trace-description" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 折叠区域

用 `Trace.Collapsible` 包裹该行，展开时显示更多细节。`Trace.Line` 放在 `Trace.CollapsibleTrigger` 内，细节放在 `Trace.CollapsibleContent` 中。

<ComponentPreview name="trace-collapsible" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 展开状态

行默认收起。绑定 `Trace.Collapsible` 的 `open`，可让某行初始展开，也可手动控制它的开合。

<ComponentPreview name="trace-open" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

要在流式输出期间自动展开，又让读者的点击优先，传入 `open ?? running`。

```svelte showLineNumbers
<script lang="ts">
  let open = $state<boolean>();
</script>

<Trace.Collapsible
  open={open ?? running}
  onOpenChange={(value) => (open = value)}
>
  <Trace.CollapsibleTrigger>
    <Trace.Line status={running ? "running" : undefined}>…</Trace.Line>
  </Trace.CollapsibleTrigger>
  <Trace.CollapsibleContent>{text}</Trace.CollapsibleContent>
</Trace.Collapsible>
```

## 链接

用链接元素包裹 `Trace.Line`。在新标签页打开时，使用右上箭头图标，并用 sr-only 加上“(opens in a new tab)”。

<ComponentPreview name="trace-link" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<a href="https://docs.astro.build" target="_blank" rel="noreferrer">
  <Trace.Line>
    <Trace.Title>
      Install Astro
      <span class="sr-only"> (opens in a new tab)</span>
    </Trace.Title>
    <Trace.Icon>
      <ArrowUpRightIcon />
    </Trace.Icon>
  </Trace.Line>
</a>
```

## 对话框

用对话框的触发器包裹 `Trace.Line`。展开状态、Escape 键和焦点返回都由对话框管理。

<ComponentPreview name="trace-dialog" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<Dialog.Root>
  <Dialog.Trigger>
    <Trace.Line>
      <Trace.Title>Searched the web for cache keys</Trace.Title>
      <Trace.Icon>
        <ChevronRightIcon />
      </Trace.Icon>
    </Trace.Line>
  </Dialog.Trigger>
  <Dialog.Content>…</Dialog.Content>
</Dialog.Root>
```

## 面板

结构与对话框相同。抽屉和弹出层的用法也一样。

<ComponentPreview name="trace-sheet" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 分组

位置相邻的多行放进同一个 `Trace.Root`。它也会为包裹 `Trace.Line` 的触发器和链接应用样式。

<ComponentPreview name="trace-group" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 来源

可折叠的行，展开内容是一个由链接行组成的 `Trace.Root`。

<ComponentPreview name="trace-sources" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

更多示例见[来源](/docs/ai-elements/sources)。

## 思维链

思维链是一个可折叠的行，内部包含各个步骤行。根据子行设置父行的状态和标题。

<ComponentPreview name="trace-steps" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

更多示例见[思维链](/docs/ai-elements/chain-of-thought)和[任务](/docs/ai-elements/task)。

## 提交

提交是一个可折叠的行，每个改动的文件对应一行。标题写明改动类型：Added、Edited 或 Deleted，增删行数放在描述里。点击文件会在[面板](#面板)中打开对应的 diff。

<ComponentPreview name="trace-commit" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 完整轮次

三层结构：轮次、摘要和行。步骤之间的文本放在两个 `Trace.Root` 列表之间。

<ComponentPreview name="trace-turn" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 推理

渲染 AI SDK 中的 `reasoning` 部分。第一段文本到达前，该行只是一个 `Trace.Line`。见[展开状态](#展开状态)。

<ComponentPreview name="trace-thinking" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

更多示例见[推理](/docs/ai-elements/reasoning)。

## 工具调用

渲染 AI SDK 中的工具调用部分。工具调用数据按[工具调用](/docs/ai-elements/tool#状态)中的方式映射。

<ComponentPreview name="trace-tool-calls" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

更多示例见[工具调用](/docs/ai-elements/tool)。

## 无障碍

`Trace` 自身不添加任何 role。每行的语义由包裹它的元素决定。

- 单独使用的 `Trace.Line` 是 `span`，按文本朗读，也不在 Tab 顺序中。
- 用 `Trace.CollapsibleTrigger` 包裹，它就成为带 `aria-expanded` 的按钮。用链接包裹，或用对话框、面板的触发器包裹，它沿用该元素的键盘与焦点行为。
- `Trace.Icon` 对辅助技术隐藏，因此 `Trace.Title` 就是无障碍名称。标题要写成说明发生了什么的一句话，例如“Edited trace.svelte”，而不只是“trace.svelte”。
- 链接在新标签页打开时，用 `sr-only` 在标题中加上“(opens in a new tab)”。
- 状态靠颜色和动效呈现，所以标题里也要写明。运行中写“Running pnpm build”，出错时写“Failed to run pnpm build”。
- 读者启用减少动态效果时，运行中标题的微光会停止，标题本身仍说明当前进展。
- 在[消息滚动容器](/docs/components/message-scroller)中，每行在添加时朗读一次。
- `Trace.CollapsibleContent` 会弱化文字颜色。如果其中放入带弱化背景的块，给该块加上 `text-foreground`，以保持对比度。[代码块](/docs/components/code-block)会设置自己的文字颜色。

## API 参考

### Trace.Root

一组行。它也会为包裹 `Trace.Line` 的触发器和链接应用样式。

| 属性    | 类型     | 默认值 | 说明                     |
| ------- | -------- | ------ | ------------------------ |
| `class` | `string` | -      | 应用到该列表的附加类名。 |

### Trace.Line

单行：一个图标和一个标题。它是 span，不是按钮，也不在 Tab 顺序中。要让它具备交互，用触发器或链接包裹它。

| 属性     | 类型                                | 默认值 | 说明                       |
| -------- | ----------------------------------- | ------ | -------------------------- |
| `status` | `"running" \| "error" \| "pending"` | -      | 该行所描述工作的状态。     |
| `class`  | `string`                            | -      | 应用到该行的附加类名。     |

### Trace.Icon

装饰性图标插槽，对辅助技术隐藏。放在标题前表示动作，放在标题后则是指示符。

| 属性    | 类型     | 默认值 | 说明                         |
| ------- | -------- | ------ | ---------------------------- |
| `class` | `string` | -      | 应用到图标插槽的附加类名。   |

### Trace.Title

一行一句话。该行运行时，标题会截断并带微光。

| 属性    | 类型     | 默认值 | 说明                     |
| ------- | -------- | ------ | ------------------------ |
| `class` | `string` | -      | 应用到标题的附加类名。   |

### Trace.Description

标题之后的次要文本，例如计数或耗时。不会截断。

| 属性    | 类型     | 默认值 | 说明                     |
| ------- | -------- | ------ | ------------------------ |
| `class` | `string` | -      | 应用到描述的附加类名。   |

### Trace.Collapsible

可展开的行。接受 [`Collapsible`](/docs/components/collapsible) 的属性。

| 属性           | 类型                      | 默认值  | 说明                     |
| -------------- | ------------------------- | ------- | ------------------------ |
| `open`         | `boolean`                 | `false` | 展开状态。可绑定。       |
| `onOpenChange` | `(open: boolean) => void` | -       | 展开状态变化时调用。     |
| `class`        | `string`                  | -       | 应用到该行的附加类名。   |

### Trace.CollapsibleTrigger

用于展开和收起该行的按钮。内部放置 `Trace.Line`。它会在行后添加一个折叠箭头。

| 属性    | 类型     | 默认值 | 说明                       |
| ------- | -------- | ------ | -------------------------- |
| `class` | `string` | -      | 应用到触发器的附加类名。   |

### Trace.CollapsibleContent

可展开行的细节内容。

| 属性    | 类型     | 默认值 | 说明                     |
| ------- | -------- | ------ | ------------------------ |
| `class` | `string` | -      | 应用到内容的附加类名。   |
