---
title: 滑块输入
description: 滑块与数值输入框的组合，拖动调整或直接输入精确数值。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/slider-field
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="slider-field-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="slider-field" />

依赖 Valar 的 Slider 与 Number Field，CLI 会一并安装。

## 用法

```svelte
<script lang="ts">
  import { SliderField } from "$lib/components/ui/slider-field/index.js";
  let height = $state(32);
</script>

<SliderField label="高度" bind:value={height} min={16} max={96} unit="px" />
```

## 行为合同

- 滑块与输入框共用一个 `value`，任一处修改另一处立即同步；`onValueChange` 只在数值实际变化时调用。
- 输入框沿用 Number Field：编辑中的 `-`、`1.` 等中间文本保留；超出范围或无效的输入标红且不改变当前值，失焦后按步长和范围规范化。清空输入框不会把值变成 0。
- 滑块键盘行为来自 Bits UI（方向键、Home/End、PageUp/PageDown），可访问名称为 `label`；输入框通过 `<label>` 关联同一名称。
- 传入 `name` 时以普通数字参与原生表单提交。`unit` 只用于显示，不进入数值。
- 不支持范围（双滑块）模式；需要时使用 Slider。
