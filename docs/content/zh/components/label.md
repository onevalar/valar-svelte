---
title: 标签
description: 渲染与控件关联的无障碍标签。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/label
  doc: https://bits-ui.com/docs/components/label
  api: https://bits-ui.com/docs/components/label#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
	import Callout from "$lib/components/callout.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="label-demo">

<div></div>

</ComponentPreview>

<Callout>

表单中的字段请使用[表单字段](/docs/components/field)组件，标签、描述与错误处理都已内置。

</Callout>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="label" />
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

```svelte
<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
</script>
```

```svelte
<Label for="email">Your email address</Label>
```

## 表单字段中的标签

表单中的字段请使用[表单字段](/docs/components/field)组件，它内置 `Field.Label`、`Field.Description` 和 `Field.Error`。

```svelte
<Field.Field>
  <Field.Label for="email">Your email address</Field.Label>
  <Input id="email" />
</Field.Field>
```

<ComponentPreview name="field-demo" class="**:[.preview]:min-h-[44rem]">

<div></div>

</ComponentPreview>
