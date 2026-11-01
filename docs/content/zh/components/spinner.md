---
title: 加载指示器
description: 表示加载状态的指示器。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/spinner
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

<ComponentPreview name="spinner-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="spinner" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `@lucide/svelte`：

</Step>

<PMInstall command="@lucide/svelte -D" />

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
  import { Spinner } from "$lib/components/ui/spinner/index.js";
</script>
```

```svelte
<Spinner />
```

## 定制

修改 `Spinner` 组件，即可把默认图标换成任意其他图标。

<ComponentPreview name="spinner-custom-demo">

<div></div>

</ComponentPreview>

```svelte showLineNumbers title="components/ui/spinner/spinner.svelte"
<script lang="ts">
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import { cn } from "$lib/utils.js";
  import type { SVGAttributes } from "svelte/elements";

  let { class: className, ...restProps }: SVGAttributes<SVGSVGElement> =
    $props();
</script>

<LoaderIcon
  role="status"
  aria-label="Loading"
  class={cn("size-4 animate-spin", className)}
  {...restProps}
/>
```

## 尺寸

用 `size-*` 工具类调整加载指示器的尺寸。

<ComponentPreview name="spinner-size-demo">

<div></div>

</ComponentPreview>

## 按钮

在按钮内加入加载指示器表示加载状态。放在文案之前并加上 `data-icon="inline-start"`，显示在起始位置；放在文案之后并加上 `data-icon="inline-end"`，显示在末尾位置。

<ComponentPreview name="spinner-button-demo">

<div></div>

</ComponentPreview>

## 徽标

在徽标内加入加载指示器表示加载状态。放在文案之前并加上 `data-icon="inline-start"`，显示在起始位置；放在文案之后并加上 `data-icon="inline-end"`，显示在末尾位置。

<ComponentPreview name="spinner-badge-demo">

<div></div>

</ComponentPreview>

## 输入框组

<ComponentPreview name="spinner-input-group-demo">

<div></div>

</ComponentPreview>

## 空状态

<ComponentPreview name="spinner-empty-demo">

<div></div>

</ComponentPreview>
