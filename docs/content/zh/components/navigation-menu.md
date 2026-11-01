---
title: 导航菜单
description: 用于网站导航的链接集合。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/navigation-menu
  doc: https://bits-ui.com/docs/components/navigation-menu
  api: https://bits-ui.com/docs/components/navigation-menu#api-reference
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

<ComponentPreview name="navigation-menu-demo" align="start">

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="navigation-menu" />
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
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
</script>
```

```svelte showLineNumbers
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Item One</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link>Link</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>
```

## 链接组件

在 `NavigationMenu.Link` 上传入 `href` 属性即可渲染为链接。用 `navigationMenuTriggerStyle()` 可以让它的样式与触发器保持一致。

```svelte showLineNumbers
<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
</script>

<NavigationMenu.Item>
  <NavigationMenu.Link href="/docs" class={navigationMenuTriggerStyle()}>
    Documentation
  </NavigationMenu.Link>
</NavigationMenu.Item>
```
