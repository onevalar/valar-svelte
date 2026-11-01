---
title: 按钮
description: 显示按钮，或外观与按钮一致的组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/button
  api: https://bits-ui.com/docs/components/button#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
	import Step from "$lib/components/step.svelte";

	let { viewerData, links } = $props();
</script>

<ComponentPreview name="button-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="button" />
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

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<Button variant="outline">Button</Button>
```

## 光标

Tailwind v4 把按钮组件的 `cursor: pointer` 改成了 `cursor: default`，详见[升级指南](https://tailwindcss.com/docs/upgrade-guide#buttons-use-the-default-cursor)。

要保留 `cursor: pointer` 的行为，在 CSS 文件中加入以下代码：

```css showLineNumbers title="app.css"
@layer base {
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
```

## 尺寸

用 `size` 属性调整按钮尺寸。

<ComponentPreview name="button-size">

<div></div>

</ComponentPreview>

## 默认

<ComponentPreview name="button-default">

<div></div>

</ComponentPreview>

## 描边

<ComponentPreview name="button-outline">

<div></div>

</ComponentPreview>

## 次要

<ComponentPreview name="button-secondary">

<div></div>

</ComponentPreview>

## 幽灵

<ComponentPreview name="button-ghost">

<div></div>

</ComponentPreview>

## 危险

<ComponentPreview name="button-destructive">

<div></div>

</ComponentPreview>

## 链接

<ComponentPreview name="button-link">

<div></div>

</ComponentPreview>

## 图标

<ComponentPreview name="button-icon">

<div></div>

</ComponentPreview>

## 带图标

图标要加上 `data-icon="inline-start"` 或 `data-icon="inline-end"` 属性，间距才会正确。

<ComponentPreview name="button-with-icon">

<div></div>

</ComponentPreview>

## 圆角

按钮圆角由全局圆角 token 和 Button 编辑器中的圆角级别控制。请在这些位置调整，不要添加 `rounded-*` 类名；`valar/button-size-via-prop` 检查会报告这类覆盖。

## 加载

在按钮内渲染 `<Spinner />` 组件即可显示加载状态。同样要为加载指示器加上 `data-icon="inline-start"` 或 `data-icon="inline-end"` 属性，间距才会正确。

<ComponentPreview name="button-loading">

<div></div>

</ComponentPreview>

## 按钮组

使用 `ButtonGroup` 组件创建按钮组，详见[按钮组](/docs/components/button-group)文档。

<ComponentPreview name="button-group-demo">

<div></div>

</ComponentPreview>

## 渲染为链接

给 `<Button />` 传入 `href` 属性，它会渲染成外观与按钮一致的 `<a>` 元素。也可以用 `buttonVariants` 辅助函数让其他元素获得按钮样式。

<ComponentPreview name="button-as-link">

<div></div>

</ComponentPreview>
