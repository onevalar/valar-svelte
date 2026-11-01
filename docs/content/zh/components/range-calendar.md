---
title: 区间日历
description: 用于选择日期区间的日历组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/range-calendar
  doc: https://bits-ui.com/docs/components/range-calendar
  api: https://bits-ui.com/docs/components/range-calendar#api-reference
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

<ComponentPreview name="range-calendar-demo">

<div></div>

</ComponentPreview>

## 关于

`<RangeCalendar />` 基于 [Bits UI Range Calendar](https://www.bits-ui.com/docs/components/range-calendar) 组件构建，日期处理由 [@internationalized/date](https://react-spectrum.adobe.com/internationalized/date/index.html) 包负责。

## 区块

在我们构建的 30 多个[日历区块](/blocks/calendar)中，可以看到 `RangeCalendar` 组件的实际效果。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="range-calendar" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `bits-ui` 和 `@internationalized/date`：

</Step>

<PMInstall command="bits-ui @internationalized/date -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>
