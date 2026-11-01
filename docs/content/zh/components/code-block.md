---
title: 代码块
description: 显示代码、终端输出和差异，可选头部、行号与复制按钮。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/code-block
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="code-block-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

`CodeBlock` 用于显示代码、终端输出、日志和差异。头部可放标题与操作按钮，还支持行号、自动换行、差异行和高亮行，并有一个小尺寸，用于在[调用链](/docs/components/trace)中展示工具输出。

语法高亮是可选项，由单独的 hook 提供，因此只显示纯文本输出的代码块依然保持轻量。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="code-block" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `shiki`：

</Step>

<PMInstall command="shiki" />

<Step>

安装所需的 Valar Svelte 依赖：

</Step>

<PMAddComp name="button use-highlighted-code" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

`code-block` 还会一并安装 `useHighlightedCode`，用于[语法高亮](#语法高亮)。

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as CodeBlock from "$lib/components/ui/code-block/index.js";
</script>
```

```svelte showLineNumbers
<CodeBlock.Root>
  <CodeBlock.Header>
    <CodeBlock.Title>Terminal</CodeBlock.Title>
    <CodeBlock.Actions>
      <CodeBlock.CopyButton value={output} />
    </CodeBlock.Actions>
  </CodeBlock.Header>
  <CodeBlock.Content code={output} />
</CodeBlock.Root>
```

## 组合

```text
CodeBlock.Root
├── CodeBlock.Header
│   ├── CodeBlock.Title
│   └── CodeBlock.Actions
│       └── CodeBlock.CopyButton
├── CodeBlock.Actions (floating, when there is no header)
├── CodeBlock.Content
│   └── CodeBlock.Line
└── CodeBlock.Footer
```

`CodeBlock.Content` 接受 `code` 字符串，或一组 `CodeBlock.Line` 子元素。需要行变体或高亮后的 token 时，改用 `CodeBlock.Line` 列表。每个 `CodeBlock.Line` 各自接受 `code`：字符串，或高亮行对应的 token。

## 特性

- **流式输出开销低。** 传入 `code` 字符串时只渲染为一个文本节点，代码陆续到达时，高亮器只对新增加的行做分词。
- **复制结果干净。** 行号和差异标记不会进入选区，空行在复制后依然保留。
- **始终从左到右阅读。** 内容固定为 `dir="ltr"`，头部则跟随页面方向。
- **高亮不依赖 WASM。** `useHighlightedCode` 使用 Shiki 的 JavaScript 引擎，每种语言在首次使用时才加载，并能渲染终端输出中的 ANSI 颜色。
- **适用于代码出现的各种位置。** 可以用在消息、调用链的行、标签页或对话框中。
- **支持键盘滚动。** 内容可聚焦，浮动操作在聚焦和悬停时都会显示。

## 基础用法

给 `CodeBlock.Content` 的 `code` 属性传入字符串。它渲染为一个文本节点，输出流式写入时开销依然很低。

<ComponentPreview name="code-block-basic" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 头部

`CodeBlock.Header` 容纳 `CodeBlock.Title` 和 `CodeBlock.Actions`。`CodeBlock.CopyButton` 复制传入的 `value`。

<ComponentPreview name="code-block-header" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

标题过长时会被截断。要让标题链接到文件，用 `<a>` 元素包裹 `CodeBlock.Title`。

```svelte showLineNumbers
<CodeBlock.Header>
  <a href="/files/route.ts">
    <CodeBlock.Title>app/api/chat/route.ts</CodeBlock.Title>
  </a>
</CodeBlock.Header>
```

## 操作

`CodeBlock.Actions` 容纳任意数量的按钮。需要换行开关时，自行维护状态并传给 `wrap`。

<ComponentPreview name="code-block-actions" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<script lang="ts">
  let wrap = $state(false);
</script>

<CodeBlock.Actions>
  <Button
    variant="ghost"
    size="icon-xs"
    aria-label="Wrap lines"
    aria-pressed={wrap}
    onclick={() => (wrap = !wrap)}
  >
    <WrapTextIcon />
  </Button>
  <CodeBlock.CopyButton value={output} />
</CodeBlock.Actions>
<CodeBlock.Content {wrap} code={output} />
```

## 浮动操作

没有头部时，把 `CodeBlock.Actions` 直接放在 `CodeBlock.Root` 内。操作浮动在顶部末端，在代码块被悬停或聚焦之前保持隐藏。触摸屏上始终显示。

<ComponentPreview name="code-block-floating-actions" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 行号

在 `CodeBlock.Content` 上加上 `lineNumbers`。`code` 字符串会按行拆分，行号不会随选区一起被复制。

<ComponentPreview name="code-block-line-numbers" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 起始行号

设置 `startLine`，行号就从指定行开始编号，适合取自文件中间的代码片段。行号栏会随最宽的行号自动加宽。

<ComponentPreview name="code-block-start-line" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 自动换行

长行默认横向滚动。加上 `wrap` 后自动换行，适合工具输出和错误信息。需要让读者自行切换时，见[操作](#操作)。

<ComponentPreview name="code-block-wrap" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 高亮行

把每一行渲染为 `CodeBlock.Line`，并给需要突出的行设置 `variant="highlighted"`。

<ComponentPreview name="code-block-highlighted-lines" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 差异

在 `CodeBlock.Line` 上设置 `variant="added"` 或 `variant="removed"`，对应的行会加上 `+` 或 `−` 标记。

<ComponentPreview name="code-block-diff" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 高度

用 `max-h-*` 类名给 `CodeBlock.Content` 设置高度上限，内容在块内滚动。

<ComponentPreview name="code-block-height" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

`CodeBlock.Content` 滚动时通过 [`scroll-fade`](/docs/utils/scroll-fade) 让边缘渐隐：默认左右渐隐，自动换行时改为上下渐隐。设了高度上限但不换行的代码块，额外加上 `scroll-fade-y`。

## 展开更多

`CodeBlock.Footer` 是内容下方的插槽。做“展开更多”时，收起状态下给内容设置高度上限，并在页脚放一个 `xs` 尺寸的幽灵按钮。

<ComponentPreview name="code-block-show-more" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<script lang="ts">
  let expanded = $state(false);
  const id = $props.id();
</script>

<CodeBlock.Content
  {id}
  class={expanded ? undefined : "max-h-64 overflow-y-hidden scroll-fade-y"}
  {code}
/>
<CodeBlock.Footer class="justify-center">
  <Button
    variant="ghost"
    size="xs"
    aria-expanded={expanded}
    aria-controls={id}
    onclick={() => (expanded = !expanded)}
  >
    {expanded ? "Show less" : "Show more"}
  </Button>
</CodeBlock.Footer>
```

### 最大高度

为避免长代码块占满整页，展开时应提高高度上限，而不是取消上限。展开后的内容可滚动，滚动时边缘渐隐。

<ComponentPreview name="code-block-show-more-scroll" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 尺寸

工具输出和[调用链](#调用链)输出使用 `size="sm"`。它的内边距更紧凑，文字为 `text-xs`。

<ComponentPreview name="code-block-size" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 危险

错误和失败的输出使用 `variant="destructive"`。

<ComponentPreview name="code-block-destructive" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 调用链

在 `Trace.CollapsibleContent` 中放一个 `size="sm"` 的 `CodeBlock.Root`，用于工具和终端输出。给 `CodeBlock.Content` 加上 `wrap` 和 `max-h-64` 类名，长输出会在调用链内换行并滚动。代码块自带文字颜色，因此 `Trace.CollapsibleContent` 不会将其调暗。

<ComponentPreview name="code-block-trace" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

更多示例见[工具调用](/docs/ai-elements/tool)、[终端](/docs/ai-elements/terminal)和[堆栈跟踪](/docs/ai-elements/stack-trace)。

## 标签页

用[标签页](/docs/components/tabs)展示多个文件，每个 `Tabs.Content` 中放一个 `CodeBlock.Root`。

<ComponentPreview name="code-block-tabs" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 消息

在[消息](/docs/components/message)的段落之间放一个 `CodeBlock.Root`。

<ComponentPreview name="code-block-chat" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 语法高亮

`useHighlightedCode` 使用 [Shiki](https://shiki.style) 完成高亮。它的 `current` 属性按行保存结果，每行一项。把每一项传给 `CodeBlock.Line` 的 `code` 属性。

<ComponentPreview name="code-block-highlighting" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<script lang="ts">
  import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte.js";

  const lines = useHighlightedCode(
    () => code,
    () => "json"
  );
</script>

<CodeBlock.Root>
  <CodeBlock.Content>
    {#each lines.current as line, index (index)}
      <CodeBlock.Line code={line} />
    {/each}
  </CodeBlock.Content>
</CodeBlock.Root>
```

Shiki 使用 JavaScript 正则引擎，无需加载 WASM。

### 语言

每种语言在首次使用时加载。编辑 `lib/highlighter.ts` 中的列表。不在列表中的语言按纯文本渲染。

<ComponentPreview name="code-block-languages" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

列表内置 `bash`、`css`、`diff`、`html`、`javascript`、`json`、`jsx`、`markdown`、`python`、`sql`、`svelte`、`tsx`、`typescript` 和 `yaml`，以及 `ts`、`js`、`sh`、`yml` 等别名。

### 终端输出

把语言设为 `"ansi"`，终端输出中的颜色才会渲染。不设置时，转义序列会作为文本显示。

<ComponentPreview name="code-block-ansi" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

ANSI 颜色不会延续到下一行。

### 服务端渲染

`highlightCode` 是异步函数，返回纯数据，因此可以在 `load` 函数中调用。Shiki 也就不会进入客户端包。

```ts showLineNumbers title="src/routes/+page.server.ts"
import { highlightCode } from "$lib/highlighter.js";

const code = `export function add(a: number, b: number) {
  return a + b;
}`;

export async function load() {
  return {
    lines: (await highlightCode(code, "ts")) ?? code.split("\n"),
  };
}
```

```svelte showLineNumbers title="src/routes/+page.svelte"
<script lang="ts">
  import * as CodeBlock from "$lib/components/ui/code-block/index.js";

  let { data } = $props();
</script>

<CodeBlock.Root>
  <CodeBlock.Content lineNumbers>
    {#each data.lines as line, index (index)}
      <CodeBlock.Line code={line} />
    {/each}
  </CodeBlock.Content>
</CodeBlock.Root>
```

### 流式输出

代码流式写入时，hook 只对新增加的行做分词，并从上一行的结束位置继续。未发生变化的行保留相同的 token，Svelte 会跳过它们。

<ComponentPreview name="code-block-streaming" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

### Markdown

用 [svelte-streamdown](https://github.com/beynar/svelte-streamdown) 渲染消息，并通过 `components.code` 把围栏代码交给 `CodeBlock` 渲染。行内代码走 `codespan` 片段，因此保持行内样式。

<ComponentPreview name="code-block-markdown" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

`code` 组件会收到 `incomplete`，在结束围栏到达之前为 `true`。代码不完整时可据此禁用复制按钮。

```svelte showLineNumbers title="markdown-code-block.svelte"
<script lang="ts">
  import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte.js";
  import * as CodeBlock from "$lib/components/ui/code-block/index.js";

  let {
    token,
    incomplete,
  }: { token: { text: string; lang?: string }; incomplete: boolean } =
    $props();

  const language = $derived(token.lang?.split(/\s/)[0] ?? "");
  const lines = useHighlightedCode(
    () => token.text,
    () => language
  );
</script>

<CodeBlock.Root>
  <CodeBlock.Header>
    <CodeBlock.Title>{language || "text"}</CodeBlock.Title>
    <CodeBlock.Actions>
      <CodeBlock.CopyButton value={token.text} disabled={incomplete} />
    </CodeBlock.Actions>
  </CodeBlock.Header>
  <CodeBlock.Content>
    {#each lines.current as line, index (index)}
      <CodeBlock.Line code={line} />
    {/each}
  </CodeBlock.Content>
</CodeBlock.Root>
```

```svelte showLineNumbers
<Streamdown
  {content}
  controls={false}
  components={{ code: MarkdownCodeBlock }}
/>
```

## 无障碍

- `CodeBlock.Content` 是包含 `code` 元素的 `pre`，固定设置 `dir="ltr"`，因此即使页面从右到左排版，代码仍按从左到右阅读。
- `CodeBlock.Content` 带有 `tabindex={0}`，键盘用户可以聚焦并滚动内容。传入 `tabindex={-1}` 即移除 Tab 停靠点。
- 焦点进入代码块时浮动操作就会显示，而不只在悬停时显示，键盘用户同样能操作。
- 行号对屏幕阅读器隐藏。
- 差异行除了底色，还带有 `+` 或 `−` 标记，变化不只靠颜色传达。
- `CodeBlock.CopyButton` 的标签为 “Copy”，复制成功后会由 `polite` 的 live region 播报 “Copied”。
- 为换行开关加上 `aria-pressed`，让状态能被播报。
- 为“展开更多”按钮加上 `aria-expanded`，并让 `aria-controls` 指向 `CodeBlock.Content` 的 `id`。

## API 参考

### CodeBlock.Root

承载头部、内容和页脚的容器。

| 属性      | 类型                         | 默认值      | 说明                                                       |
| --------- | ---------------------------- | ----------- | ---------------------------------------------------------- |
| `variant` | `"default" \| "destructive"` | `"default"` | 代码块的色调。                                             |
| `size`    | `"default" \| "sm"`          | `"default"` | `"sm"` 内边距更紧凑，代码为 `text-xs`，用于工具输出。       |
| `class`   | `string`                     | -           | 应用于代码块的额外类名。                                   |

### CodeBlock.Header

内容上方的一行，用于放置标题和操作按钮。

| 属性    | 类型     | 默认值 | 说明                         |
| ------- | -------- | ------ | ---------------------------- |
| `class` | `string` | -      | 应用于头部的额外类名。       |

### CodeBlock.Title

文件名或标签，可带图标。过长时截断。

| 属性    | 类型     | 默认值 | 说明                         |
| ------- | -------- | ------ | ---------------------------- |
| `class` | `string` | -      | 应用于标题的额外类名。       |

### CodeBlock.Actions

在头部末端承载按钮。作为 `CodeBlock.Root` 的直接子元素时会浮动显示。

| 属性    | 类型     | 默认值 | 说明                         |
| ------- | -------- | ------ | ---------------------------- |
| `class` | `string` | -      | 应用于操作的额外类名。       |

### CodeBlock.CopyButton

幽灵样式的图标按钮，把 `value` 复制到剪贴板。接受 [`Button`](/docs/components/button) 的属性。

| 属性    | 类型     | 默认值 | 说明                          |
| ------- | -------- | ------ | ----------------------------- |
| `value` | `string` | -      | 必填。要复制的文本。          |
| `class` | `string` | -      | 应用于按钮的额外类名。        |

### CodeBlock.Content

可滚动或自动换行的 `pre`。

| 属性          | 类型      | 默认值  | 说明                                                            |
| ------------- | --------- | ------- | --------------------------------------------------------------- |
| `code`        | `string`  | -       | 要渲染的纯文本。设置后忽略 `children`。                          |
| `children`    | `Snippet` | -       | 一组 `CodeBlock.Line`。                                         |
| `wrap`        | `boolean` | `false` | 长行自动换行，而不是滚动。                                      |
| `lineNumbers` | `boolean` | `false` | 为每行编号。传入 `code` 字符串时会按行拆分。                    |
| `startLine`   | `number`  | `1`     | 设置 `lineNumbers` 时首行的行号。                               |
| `tabindex`    | `number`  | `0`     | 让内容可聚焦，从而能用键盘滚动。                                |
| `class`       | `string`  | -       | 应用于内容的额外类名，例如 `max-h-72`。                         |

### CodeBlock.Line

一行代码。

| 属性      | 类型                                                 | 默认值      | 说明                                                                   |
| --------- | ---------------------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `variant` | `"default" \| "added" \| "removed" \| "highlighted"` | `"default"` | 该行的状态。                                                           |
| `code`    | `string \| CodeBlockLineToken[]`                     | -           | 以纯文本或高亮 token 表示的行内容。设置后忽略 `children`。             |
| `class`   | `string`                                             | -           | 应用于该行的额外类名。                                                 |

### CodeBlock.Footer

内容下方的一行，例如放置“展开更多”按钮。

| 属性    | 类型     | 默认值 | 说明                         |
| ------- | -------- | ------ | ---------------------------- |
| `class` | `string` | -      | 应用于页脚的额外类名。       |

### useHighlightedCode

```ts
const lines = useHighlightedCode(
  () => code,
  () => language
);
```

返回一个对象，其 `current` 属性按行保存结果，每行一项，用作 `CodeBlock.Line` 的 `code` 属性。高亮完成后，每一项是该行的 token 列表；在此之前，以及语言不在列表中时，它是普通字符串。

| 参数       | 类型           | 说明                                                        |
| ---------- | -------------- | ----------------------------------------------------------- |
| `code`     | `() => string` | 要高亮的代码。末尾换行会被忽略。                            |
| `language` | `() => string` | `lib/highlighter.ts` 中的语言或别名，或 `"ansi"`。          |
