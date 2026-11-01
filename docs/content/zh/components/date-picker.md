---
title: 日期选择器
description: 支持日期区间与预设的日期选择器组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/examples/date-picker-demo.svelte
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
</script>

<ComponentPreview name="date-picker-demo">

<div></div>

</ComponentPreview>

## 安装

日期选择器由 `<Popover />` 与 `<Calendar />` 或 `<RangeCalendar />` 组合而成。

安装步骤见 [Popover](/docs/components/popover#安装)、[Calendar](/docs/components/calendar#安装) 和 [Range Calendar](/docs/components/range-calendar#安装) 组件文档。

## 用法

```svelte showLineNumbers title="lib/components/example-date-picker.svelte"
<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import {
    type DateValue,
    DateFormatter,
    getLocalTimeZone,
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";

  const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });

  let value = $state<DateValue>();
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        variant="outline"
        class={cn(
          "w-[280px] justify-start text-start font-normal",
          !value && "text-muted-foreground"
        )}
        {...props}
      >
        <CalendarIcon class="me-2 size-4" />
        {value ? df.format(value.toDate(getLocalTimeZone())) : "Select a date"}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0">
    <Calendar bind:value type="single" initialFocus captionLayout="dropdown" />
  </Popover.Content>
</Popover.Root>
```

## 组合

日期选择器由 `Popover` 和 `Calendar` 组合而成，没有 `DatePicker` 根组件：

```text
Popover.Root
├── Popover.Trigger
└── Popover.Content
    └── Calendar
```

## 基础用法

基础日期选择器组件。

<ComponentPreview name="date-picker-basic">

<div></div>

</ComponentPreview>

## 区间选择器

用于选择日期区间的日期选择器组件。

<ComponentPreview name="date-picker-range">

<div></div>

</ComponentPreview>

## 出生日期

用于选择出生日期的日期选择器组件。标题栏以下拉菜单呈现，月份和日期可分别选择。

<ComponentPreview name="date-picker-dob">

<div></div>

</ComponentPreview>

## 输入框

带输入框的日期选择器组件，可直接输入日期。

<ComponentPreview name="date-picker-input">

<div></div>

</ComponentPreview>

## 时间选择器

带时间输入框的日期选择器组件，可选择具体时间。

<ComponentPreview name="date-picker-time">

<div></div>

</ComponentPreview>

## 自然语言选择器

该组件使用 `chrono-node` 库解析自然语言描述的日期。

<ComponentPreview name="date-picker-natural-language">

<div></div>

</ComponentPreview>
