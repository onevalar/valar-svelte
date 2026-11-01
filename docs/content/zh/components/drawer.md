---
title: 抽屉
description: 适用于 Svelte 的抽屉组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/drawer
  doc: https://github.com/huntabyte/vaul-svelte
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

<ComponentPreview name="drawer-demo">

<div></div>

</ComponentPreview>

## 关于

抽屉基于 [Vaul Svelte](https://vaul-svelte.com) 构建，后者是 [Emil Kowalski](https://twitter.com/emilkowalski_) 开发的 [Vaul](https://vaul.emilkowal.ski) 的 Svelte 版本。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="drawer" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `vaul-svelte`：

</Step>

<PMInstall command="vaul-svelte@next -D" />

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
  import * as Drawer from "$lib/components/ui/drawer/index.js";
</script>
```

```svelte showLineNumbers
<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Are you absolutely sure?</Drawer.Title>
      <Drawer.Description>This action cannot be undone.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Footer>
      <Button>Submit</Button>
      <Drawer.Close>Cancel</Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
```

## 位置

用 `direction` 属性设置抽屉的弹出方向。

可选值为 `top`、`right`、`bottom` 和 `left`。

<ComponentPreview name="drawer-sides">

<div></div>

</ComponentPreview>

## 嵌套

在抽屉内部打开另一个抽屉，使用 `<Drawer.NestedRoot />`。父级抽屉保持挂载，堆叠在最前方抽屉的后面。

<ComponentPreview name="drawer-nested">

<div></div>

</ComponentPreview>

## 非模态

传入 `modal={false}`，抽屉打开时页面其余部分仍可交互。点击非模态抽屉外部不会关闭它。

<ComponentPreview name="drawer-non-modal">

<div></div>

</ComponentPreview>

## 吸附点

用 `snapPoints` 让抽屉吸附到预设高度。`0` 到 `1` 之间的数字表示视口高度的比例，字符串值支持 `px` 单位。吸附点仅对垂直方向的抽屉生效。

用 `bind:activeSnapPoint` 跟踪当前吸附点。

<ComponentPreview name="drawer-snap-points">

<div></div>

</ComponentPreview>

## 响应式

组合 `Dialog` 和 `Drawer` 组件即可创建响应式对话框：桌面端渲染 `Dialog`，移动端渲染 `Drawer`。

<ComponentPreview name="drawer-dialog">

<div></div>

</ComponentPreview>
