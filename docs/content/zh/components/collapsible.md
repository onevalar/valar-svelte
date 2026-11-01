---
title: 折叠区域
description: 展开、收起面板的交互组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/collapsible
  doc: https://bits-ui.com/docs/components/collapsible
  api: https://bits-ui.com/docs/components/collapsible#api-reference
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

<ComponentPreview name="collapsible-demo" align="start">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="collapsible" />
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

```svelte showLineNumbers
<script lang="ts">
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
</script>
```

```svelte showLineNumbers
<Collapsible.Root>
  <Collapsible.Trigger>Can I use this in my project?</Collapsible.Trigger>
  <Collapsible.Content>
    Yes. Free to use for personal and commercial projects. No attribution
    required.
  </Collapsible.Content>
</Collapsible.Root>
```

## 受控状态

用 `bind:open` 控制展开状态。

```svelte showLineNumbers
<script lang="ts">
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";

  let open = $state(false);
</script>

<Collapsible.Root bind:open>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Content>Content</Collapsible.Content>
</Collapsible.Root>
```

## 基础用法

<ComponentPreview name="collapsible-basic" align="start">

<div></div>

</ComponentPreview>

## 设置面板

用触发按钮展开更多设置。

<ComponentPreview name="collapsible-settings">

<div></div>

</ComponentPreview>

## 文件树

用嵌套的折叠区域构建文件树。

<ComponentPreview name="collapsible-file-tree" class="**:[.preview]:min-h-[600px]">

<div></div>

</ComponentPreview>
