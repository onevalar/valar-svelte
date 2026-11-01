---
title: 附件
description: 显示文件或图片附件，包含媒体、元数据、上传状态与操作。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/attachment
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

<ComponentPreview name="attachment-demo" class="bg-surface dark:bg-background" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background">

<div></div>

</ComponentPreview>

`Attachment` 组件显示文件或图片附件，包含媒体、名称和元数据，并支持可选的操作与上传状态。用于聊天输入区、消息列表和上传列表中的文件与图片。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="attachment" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装所需的 Valar Svelte 依赖：

</Step>

<PMAddComp name="button" />

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

```svelte
<script lang="ts">
  import * as Attachment from "$lib/components/ui/attachment/index.js";
</script>
```

```svelte
<Attachment.Root>
  <Attachment.Media>
    <FileTextIcon />
  </Attachment.Media>
  <Attachment.Content>
    <Attachment.Title>sales-dashboard.pdf</Attachment.Title>
    <Attachment.Description>PDF · 2.4 MB</Attachment.Description>
  </Attachment.Content>
  <Attachment.Actions>
    <Attachment.Action aria-label="Remove sales-dashboard.pdf">
      <XIcon />
    </Attachment.Action>
  </Attachment.Actions>
</Attachment.Root>
```

## 组合

按以下组合方式构建附件：

```text
Attachment.Root
├── Attachment.Media
├── Attachment.Content
│   ├── Attachment.Title
│   └── Attachment.Description
├── Attachment.Actions
│   └── Attachment.Action
└── Attachment.Trigger
```

使用 `Attachment.Group` 把多个附件排成可滚动的一行：

```text
Attachment.Group
├── Attachment.Root
└── Attachment.Root
```

## 特性

- 通过 `Attachment.Media` 渲染图标或图片媒体
- 五种上传状态：`idle`、`uploading`、`processing`、`error` 和 `done`，内置对应样式，处理中带微光动画
- 三种尺寸，支持横向与纵向排列
- `Attachment.Trigger` 覆盖整张卡片，可打开链接或对话框，操作按钮仍可单独点击
- `Attachment.Group` 可滚动、带吸附效果与边缘渐隐
- 每个部件都接受 `class` 属性，可自定义样式

## 图片

在 `Attachment.Media` 上设置 `variant="image"`，并在其中渲染 `<img>`。传入 `orientation="vertical"` 可把媒体堆叠到内容上方。

<ComponentPreview name="attachment-image" class="bg-surface dark:bg-background" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background">

<div></div>

</ComponentPreview>

## 状态

用 `state` 反映上传过程。`uploading` 和 `processing` 状态下标题带微光动画，`error` 状态下改用危险样式。

<ComponentPreview name="attachment-states" class="bg-surface dark:bg-background" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background">

<div></div>

</ComponentPreview>

## 尺寸

用 `size` 在 `default`、`sm` 和 `xs` 之间切换。

<ComponentPreview name="attachment-sizes" class="bg-surface dark:bg-background" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background">

<div></div>

</ComponentPreview>

## 分组

用 `Attachment.Group` 包裹附件，排成可横向滚动、带吸附效果与边缘渐隐的一行。

<ComponentPreview name="attachment-group" class="bg-surface dark:bg-background" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background">

<div></div>

</ComponentPreview>

## 触发器

加入 `Attachment.Trigger`，让整张卡片可以打开链接或对话框。它铺在操作按钮下层并覆盖整张卡片，因此操作按钮仍可点击。

<ComponentPreview name="attachment-trigger" class="bg-surface dark:bg-background" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background">

<div></div>

</ComponentPreview>

```svelte showLineNumbers
<Dialog.Root>
  <Attachment.Root>
    <!-- media, content, actions -->
    <Dialog.Trigger>
      {#snippet child({ props })}
        <Attachment.Trigger
          aria-label="Preview research-summary.pdf"
          {...props}
        />
      {/snippet}
    </Dialog.Trigger>
  </Attachment.Root>
  <Dialog.Content><!-- ... --></Dialog.Content>
</Dialog.Root>
```

## 无障碍

`Attachment.Action` 渲染为 `Button`，`Attachment.Trigger` 渲染为真正的 `<button>`（或通过 `child` 片段指定你的元素）。按以下准则处理，确保两者都能操作并被正确播报。

### 为纯图标操作添加标签

`Attachment.Action` 通常只放图标，因此要为每个操作按钮加上 `aria-label`，说明操作内容与作用对象。

```svelte showLineNumbers
<Attachment.Action aria-label="Remove sales-dashboard.pdf">
  <XIcon />
</Attachment.Action>
```

### 为触发器添加标签

`Attachment.Trigger` 覆盖整张卡片且自身没有文本，因此要用 `aria-label` 说明激活后的行为。

```svelte showLineNumbers
<Attachment.Trigger>
  {#snippet child({ props })}
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Open workspace.png"
      {...props}
    ></a>
  {/snippet}
</Attachment.Trigger>
```

触发器在层叠顺序中位于操作按钮之下，因此 `Attachment.Action` 与 `Attachment.Trigger` 不会互相遮挡。两者仍可分别获得焦点并点击。

### 键盘滚动

`Attachment.Group` 横向滚动。附件可交互（带触发器或操作按钮）时，键盘用户通过 Tab 键到达屏幕外的项。若这一行附件仅用于展示，则给分组本身加上 `tabindex={0}`、`role="group"` 和 `aria-label`，让它可聚焦、可滚动。

### 颜色之外的含义

`error` 状态使用危险色。把失败原因写在 `Attachment.Description` 中，避免只靠颜色传达状态。

## API 参考

### Attachment

附件根容器。

| 属性          | 类型                                                         | 默认值         | 说明                               |
| ------------- | ------------------------------------------------------------ | -------------- | ---------------------------------- |
| `state`       | `"idle" \| "uploading" \| "processing" \| "error" \| "done"` | `"done"`       | 上传状态。决定样式与微光动画。     |
| `size`        | `"default" \| "sm" \| "xs"`                                  | `"default"`    | 附件的尺寸。                       |
| `orientation` | `"horizontal" \| "vertical"`                                 | `"horizontal"` | 媒体位于内容旁边还是上方。         |
| `class`       | `string`                                                     | -              | 附加到根元素的类名。               |

### Attachment.Media

用于图标或图片预览的媒体插槽。

| 属性      | 类型                | 默认值   | 说明                             |
| --------- | ------------------- | -------- | -------------------------------- |
| `variant` | `"icon" \| "image"` | `"icon"` | 媒体中放图标还是 `<img>`。       |
| `class`   | `string`            | -        | 附加到媒体插槽的类名。           |

### Attachment.Content

包裹标题和描述。

| 属性    | 类型     | 默认值 | 说明                       |
| ------- | -------- | ------ | -------------------------- |
| `class` | `string` | -      | 附加到内容插槽的类名。     |

### Attachment.Title

附件名称。附件处于 `uploading` 或 `processing` 状态时带微光动画。

| 属性    | 类型     | 默认值 | 说明                   |
| ------- | -------- | ------ | ---------------------- |
| `class` | `string` | -      | 附加到标题的类名。     |

### Attachment.Description

次要元数据，例如文件类型、大小或上传状态。

| 属性    | 类型     | 默认值 | 说明                   |
| ------- | -------- | ------ | ---------------------- |
| `class` | `string` | -      | 附加到描述的类名。     |

### Attachment.Actions

操作按钮的容器，对齐到附件末尾。

| 属性    | 类型     | 默认值 | 说明                       |
| ------- | -------- | ------ | -------------------------- |
| `class` | `string` | -      | 附加到操作区域的类名。     |

### Attachment.Action

操作按钮。渲染为 [`Button`](/docs/components/button)，接受它的全部属性。

| 属性       | 类型           | 默认值      | 说明                         |
| ---------- | -------------- | ----------- | ---------------------------- |
| `size`     | `Button` 尺寸  | `"icon-xs"` | 按钮尺寸。                   |
| `...props` | `Button` 属性  | -           | 透传给底层 `Button` 的属性。 |

### Attachment.Trigger

覆盖整张卡片、用于激活附件的遮罩层。默认渲染为 `<button>`。

| 属性    | 类型      | 默认值 | 说明                           |
| ------- | --------- | ------ | ------------------------------ |
| `child` | `snippet` | -      | 渲染为子元素，例如链接。       |
| `class` | `string`  | -      | 附加到触发器的类名。           |

### Attachment.Group

把附件排成可横向滚动、带吸附效果的一行。

| 属性    | 类型     | 默认值 | 说明                   |
| ------- | -------- | ------ | ---------------------- |
| `class` | `string` | -      | 附加到分组的类名。     |
