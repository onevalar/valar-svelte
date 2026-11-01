---
title: 消息提示
description: 面向 Svelte 的轻提示组件，样式已内置。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/sonner
  doc: https://svelte-sonner.vercel.app/
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

<ComponentPreview name="sonner-demo">

<div></div>

</ComponentPreview>

## 关于

消息提示组件由 [svelte-sonner](https://svelte-sonner.vercel.app/) 提供，它是 [Sonner](https://sonner.emilkowal.ski/) 的 Svelte 版本。Sonner 最初由 [Emil Kowalski](https://twitter.com/emilkowalski_) 为 React 开发。

## 安装

<Step>设置主题支持</Step>

消息提示默认按用户的系统偏好决定显示浅色还是深色主题。要改变这一行为，可给组件传入自定义的 `theme` 属性，或改用 [mode-watcher](https://github.com/svecosystem/mode-watcher)，需要时把它固定为 `dark` 或 `light` 模式。

深色模式支持的设置方式见[深色模式](/docs/dark-mode)。

如果不打算支持深色模式，可以在用 CLI 安装后卸载 `mode-watcher`，再从组件中移除 `theme` 属性；也可以手动安装组件，不引入 `mode-watcher`。

<InstallTabs>
{#snippet cli()}
<Steps>

<Step>运行以下命令：</Step>
<PMAddComp name="sonner" />

<Step>添加 Toaster 组件</Step>

```svelte showLineNumbers title="+layout.svelte" {2,6}
<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  let { children } = $props();
</script>

<Toaster />

{@render children?.()}
```

</Steps>
{/snippet}
{#snippet manual()}

<Steps>
<Step>

安装 `svelte-sonner`：

</Step>

<PMInstall command="svelte-sonner -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

<Step>添加 Toaster 组件</Step>

```svelte showLineNumbers title="+layout.svelte" {2,6}
<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  let { children } = $props();
</script>

<Toaster />

{@render children?.()}
```

</Steps>
{/snippet}
</InstallTabs>

## 用法

```svelte
<script lang="ts">
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button/index.js";
</script>
```

```svelte
<Button onclick={() => toast("Hello world")}>Show toast</Button>
```

## 类型

<ComponentPreview name="sonner-types">

<div></div>

</ComponentPreview>

## 描述

<ComponentPreview name="sonner-description">

<div></div>

</ComponentPreview>

## 位置

用 `position` 属性改变轻提示的位置。

<ComponentPreview name="sonner-position">

<div></div>

</ComponentPreview>

## 变更记录

### 2025-12 图标

消息提示组件已改用 `lucide` 的图标。更新 `sonner.svelte` 文件，换用新图标。

```svelte showLineNumbers title="components/ui/sonner.svelte" {2-6,22-36}
<script lang="ts">
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import InfoIcon from "@lucide/svelte/icons/info";
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import OctagonXIcon from "@lucide/svelte/icons/octagon-x";
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";

  import {
    Toaster as Sonner,
    type ToasterProps as SonnerProps,
  } from "svelte-sonner";
  import { mode } from "mode-watcher";

  let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
  theme={mode.current}
  class="toaster group"
  style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
  {...restProps}
  >{#snippet loadingIcon()}
    <Loader2Icon class="size-4 animate-spin" />
  {/snippet}
  {#snippet successIcon()}
    <CircleCheckIcon class="size-4" />
  {/snippet}
  {#snippet errorIcon()}
    <OctagonXIcon class="size-4" />
  {/snippet}
  {#snippet infoIcon()}
    <InfoIcon class="size-4" />
  {/snippet}
  {#snippet warningIcon()}
    <TriangleAlertIcon class="size-4" />
  {/snippet}
</Sonner>
```
