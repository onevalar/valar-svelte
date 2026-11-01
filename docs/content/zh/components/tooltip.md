---
title: 工具提示
description: 在元素获得键盘焦点或鼠标悬停时，显示与该元素相关信息的弹窗。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/tooltip
  doc: https://bits-ui.com/docs/components/tooltip
  api: https://bits-ui.com/docs/components/tooltip#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="tooltip-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="tooltip" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `bits-ui`：

</Step>

<PMInstall command="bits-ui -D" />

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

`Tooltip.Provider` 在根布局中放置一次，包裹所有会用到工具提示的内容。这样同一个 provider 内同时只会打开一个工具提示。

```svelte title="src/routes/+layout.svelte" showLineNumbers
<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";

  let { children } = $props();
</script>
```

```svelte showLineNumbers
<Tooltip.Provider>
  {@render children()}
</Tooltip.Provider>
```

之后即可在应用任意位置使用工具提示：

```svelte
<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<Tooltip.Root>
  <Tooltip.Trigger>Hover</Tooltip.Trigger>
  <Tooltip.Content>
    <p>Add to library</p>
  </Tooltip.Content>
</Tooltip.Root>
```

### 嵌套 Provider

嵌套 provider，为不同区域设置不同参数。工具提示使用最近的祖先 provider。需要在特定区域立即显示工具提示时，这种做法很有用：

```svelte
<Tooltip.Provider delayDuration={0}>
  <!-- Tooltips here will open instantly -->
</Tooltip.Provider>
```

## 方向

用 `side` 属性改变工具提示的位置。

<ComponentPreview name="tooltip-sides">

<div></div>

</ComponentPreview>

## 带键盘快捷键

<ComponentPreview name="tooltip-keyboard">

<div></div>

</ComponentPreview>

## 禁用按钮

用 `<span>` 包裹禁用的按钮，即可在按钮上显示工具提示。

<ComponentPreview name="tooltip-disabled">

<div></div>

</ComponentPreview>

## 变更记录

### 2025-12 更新工具提示颜色

工具提示的颜色已更新：背景使用前景色，前景使用背景色。

把 `<Tooltip.Content />` 的 `bg-primary text-primary-foreground` 换成 `bg-foreground text-background`。
