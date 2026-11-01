---
title: Svelte
description: 为 Svelte 站点添加深色模式。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
</script>

<Steps>

## 安装 mode-watcher

先安装 `mode-watcher`：

<PMInstall command="mode-watcher" />

## 添加 ModeWatcher 组件

导入 `ModeWatcher` 组件，在根布局中使用：

```svelte title="src/routes/+layout.svelte" showLineNumbers {3,7}
<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  let { children } = $props();
</script>

<ModeWatcher />
{@render children?.()}
```

## 添加模式切换控件

在站点中放置模式切换控件，用于在浅色与深色模式之间切换。

<ComponentPreview name="dark-mode-light-switch">

<div></div>

</ComponentPreview>

<ComponentPreview name="dark-mode-dropdown-menu">

<div></div>

</ComponentPreview>

</Steps>
