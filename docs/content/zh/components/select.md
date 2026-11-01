---
title: 选择器
description: 由按钮触发的选项列表，供用户选择。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/select
  doc: https://bits-ui.com/docs/components/select
  api: https://bits-ui.com/docs/components/select#api-reference
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

<ComponentPreview name="select-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="select" />
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
  import * as Select from "$lib/components/ui/select/index.js";
</script>
```

```svelte showLineNumbers
<Select.Root type="single">
  <Select.Trigger class="w-[180px]">
    <Select.Value placeholder="Select a theme" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="light">Light</Select.Item>
    <Select.Item value="dark">Dark</Select.Item>
    <Select.Item value="system">System</Select.Item>
  </Select.Content>
</Select.Root>
```

`Select.Value` 渲染选中项的标签，未选中任何项时回退到 `placeholder`。

标签取自对应的 `Select.Item`，而该项只在菜单打开时存在于 DOM 中。给 `Select.Root` 传入 `items`，菜单关闭后标签仍能保留：

```svelte showLineNumbers
<script lang="ts">
  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];
</script>

<Select.Root type="single" items={themes}>
  <Select.Trigger class="w-[180px]">
    <Select.Value placeholder="Select a theme" />
  </Select.Trigger>
  <Select.Content>
    {#each themes as theme (theme.value)}
      <Select.Item value={theme.value}>{theme.label}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
```

不传 `items` 时，触发器回退为显示原始值，因此只有当选项的标签与值不同时才需要传入。

## 分组

用 `Select.Group`、`Select.Label` 和 `Select.Separator` 组织选项。

<ComponentPreview name="select-groups">

<div></div>

</ComponentPreview>

## 可滚动

选项较多时，选择器可以滚动。

<ComponentPreview name="select-scrollable">

<div></div>

</ComponentPreview>

## 禁用

<ComponentPreview name="select-disabled">

<div></div>

</ComponentPreview>

## 无效

为 `Field.Field` 组件添加 `data-invalid` 属性，为 `Select.Trigger` 组件添加 `aria-invalid` 属性，即可显示错误状态。

```svelte showLineNumbers /data-invalid/ /aria-invalid/
<Field.Field data-invalid>
  <Field.Label>Fruit</Field.Label>
  <Select.Trigger aria-invalid>
    <Select.Value />
  </Select.Trigger>
</Field.Field>
```

<ComponentPreview name="select-invalid">

<div></div>

</ComponentPreview>
