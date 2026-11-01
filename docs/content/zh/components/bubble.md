---
title: 气泡
description: 在消息气泡中显示对话内容。支持变体、对齐、分组、表情回应与可折叠内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/bubble
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

<ComponentPreview name="bubble-demo" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

`Bubble` 组件显示带外框的对话内容，适合聊天文本、简短的结构化输出、引用的回复、建议和表情回应。

完整的聊天界面请使用 [`Message`](/docs/components/message) 组件。`Bubble` 只负责气泡本身，头像、名称、时间戳、元数据和消息级操作都放在 [`Message`](/docs/components/message) 中。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="bubble" />
{/snippet}
{#snippet manual()}
<Steps>

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

```svelte showLineNumbers
<script lang="ts">
  import * as Bubble from "$lib/components/ui/bubble/index.js";
</script>
```

```svelte showLineNumbers
<Bubble.Root>
  <Bubble.Content>
    I checked the registry output and removed the stale route.
  </Bubble.Content>
  <Bubble.Reactions>
    <span>👍</span>
  </Bubble.Reactions>
</Bubble.Root>
```

## 组合

按以下组合方式构建气泡：

```text
Bubble.Root
├── Bubble.Content
└── Bubble.Reactions
```

使用 `Bubble.Group` 把同一发送者的连续气泡归为一组：

```text
Bubble.Group
├── Bubble.Root
│   └── Bubble.Content
└── Bubble.Root
    └── Bubble.Content
```

## 特性

- 七种视觉变体，从强调的主色气泡到无外框的幽灵样式
- 发送者与接收者的气泡可对齐到起始或末尾
- 表情回应贴附在气泡边缘，所在侧与对齐方式均可配置
- 气泡按内容自适应宽度，最多占容器宽度的 80%
- 通过 `child` 片段把内容渲染为链接或按钮
- 每个部件都接受 `class` 属性，可自定义样式

## 变体

用 `variant` 属性切换气泡的视觉样式。

<ComponentPreview name="bubble-variants" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

| 变体          | 说明                                   |
| ------------- | -------------------------------------- |
| `default`     | 强调的主色气泡，通常用于当前用户。     |
| `secondary`   | 标准的中性气泡，用于对话内容。         |
| `muted`       | 弱化气泡，用于辅助性的次要内容。       |
| `tinted`      | 轻微着色的主色调气泡。                 |
| `outline`     | 带边框的气泡，用于次要内容或富内容。   |
| `ghost`       | 无外框样式，用于助手文本或富内容。     |
| `destructive` | 危险气泡，用于错误或失败的操作。       |

气泡按内容自适应宽度，最多占容器宽度的 80%。`ghost` 变体取消最大宽度限制，助手文本和富内容可以占满整行。

## 对齐

在 `Bubble.Root` 上传入 `align`，把气泡对齐到对话的起始或末尾。

<ComponentPreview name="bubble-alignment" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

| align   | 说明                       |
| ------- | -------------------------- |
| `start` | 气泡对齐到对话起始位置。   |
| `end`   | 气泡对齐到对话末尾位置。   |

**注意：** 构建聊天界面时，通常应在 `Message` 组件上设置对齐，而不是 `Bubble` 组件。

## 气泡组

使用 `Bubble.Group` 把同一发送者的连续气泡归为一组。`align` 属性要设在 `Bubble.Root` 上，而不是 `Bubble.Group`。

```text
Bubble.Group
├── Bubble.Root
│   └── Bubble.Content
└── Bubble.Root
    └── Bubble.Content
```

<ComponentPreview name="bubble-group-demo" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 链接与按钮

在 `Bubble.Content` 上使用 `child` 片段，可把气泡渲染为链接或按钮。

<ComponentPreview name="bubble-link-button" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<script lang="ts">
  import * as Bubble from "$lib/components/ui/bubble/index.js";
</script>

<Bubble.Root variant="muted">
  <Bubble.Content>
    {#snippet child({ props })}
      <button {...props}>Click here</button>
    {/snippet}
  </Bubble.Content>
</Bubble.Root>
```

## 表情回应

`Bubble.Reactions` 用于展示气泡上的表情回应，也可以放快捷操作按钮。用 `side` 和 `align` 控制这一行的位置，`side="top"` 会贴到气泡上边缘。表情回应与气泡边缘重叠，行与行之间要留出垂直间距，下面的示例为此使用了更大的 `gap`。

<ComponentPreview name="bubble-reactions" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 展开更多 / 折叠区域

较长的气泡内容可以与 [`Collapsible`](/docs/components/collapsible) 组合，实现展开或收起。用 `Collapsible.Trigger` 触发折叠内容。

<ComponentPreview name="bubble-collapsible" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 工具提示

用 [`Tooltip`](/docs/components/tooltip) 包裹气泡，可在悬停时显示元数据，例如消息的已读时间。

<ComponentPreview name="bubble-tooltip" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 弹出层

把气泡与 [`Popover`](/docs/components/popover) 搭配，可按需展示更多信息，例如失败操作的完整错误信息。

<ComponentPreview name="bubble-popover" previewStyle="rhea" previewClassName="h-auto theme-blue">

<div></div>

</ComponentPreview>

## 无障碍

`Bubble` 只负责消息的呈现层。对话级语义留在外层容器上，并遵循以下准则。

### 为回应添加标签

表情回应是一行 emoji。屏幕阅读器会脱离上下文逐个读出符号，像 `+8` 这样的计数会被读成 “plus eight”。用 `role="img"` 把整行作为一张图片，配上描述性的 `aria-label`，让它只播报一次。`role="img"` 也会让辅助技术忽略单个 emoji，因此不需要再加 `aria-hidden`。

```svelte showLineNumbers
<Bubble.Reactions
  role="img"
  aria-label="Reactions: thumbs up, fire, and 8 more"
>
  <span>👍</span>
  <span>🔥</span>
  <span>+8</span>
</Bubble.Reactions>
```

表情回应可交互时，改为渲染按钮，并给纯图标按钮加上 `aria-label`。

```svelte showLineNumbers
<Bubble.Reactions>
  <Button aria-label="Thumbs up" variant="secondary" size="icon-xs">
    <ThumbsUpIcon />
  </Button>
</Bubble.Reactions>
```

### 可交互气泡

气泡可点击时，通过 `child` 片段把它渲染为真正的 `<button>` 或 `<a>`，这样既能获得焦点，也能暴露正确的角色。`Bubble.Content` 为可交互元素内置了可见的焦点环，无障碍名称取自气泡文本，无需额外标注。

```svelte showLineNumbers
<Bubble.Root variant="muted" align="end">
  <Bubble.Content>
    {#snippet child({ props })}
      <button type="button" {...props} onclick={onReply}>
        I forgot my password
      </button>
    {/snippet}
  </Bubble.Content>
</Bubble.Root>
```

### 颜色之外的含义

气泡变体用颜色区分角色和语气。搭配文本、对齐方式或图标，避免只靠颜色传达含义。`destructive` 气泡应把错误上下文写进消息文本，而不是依赖颜色处理。

## API 参考

### Bubble

气泡根容器。

| 属性      | 类型                                                                                       | 默认值      | 说明                 |
| --------- | ------------------------------------------------------------------------------------------ | ----------- | -------------------- |
| `variant` | `"default" \| "secondary" \| "muted" \| "tinted" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 气泡的视觉样式。     |
| `align`   | `"start" \| "end"`                                                                         | `"start"`   | 气泡的行内对齐方式。 |
| `class`   | `string`                                                                                   | -           | 附加到根元素的类名。 |

### Bubble.Content

气泡内容容器。

| 属性    | 类型      | 默认值 | 说明                     |
| ------- | --------- | ------ | ------------------------ |
| `child` | `snippet` | -      | 把内容渲染为子元素。     |
| `class` | `string`  | -      | 附加到内容元素的类名。   |

### Bubble.Reactions

显示与气泡边缘重叠的表情回应。

| 属性    | 类型                | 默认值     | 说明                         |
| ------- | ------------------- | ---------- | ---------------------------- |
| `side`  | `"top" \| "bottom"` | `"bottom"` | 表情回应贴附的气泡一侧。     |
| `align` | `"start" \| "end"`  | `"end"`    | 表情回应的行内对齐方式。     |
| `class` | `string`            | -          | 附加到表情回应行的类名。     |

### Bubble.Group

把同一发送者的连续气泡归为一组。

| 属性    | 类型     | 默认值 | 说明                       |
| ------- | -------- | ------ | -------------------------- |
| `class` | `string` | -      | 附加到分组根元素的类名。   |
