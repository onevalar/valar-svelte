---
title: 颜色选择器
description: 选择颜色：色盘、十六进制输入与预设色块，值为 #rrggbb。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/color-picker
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="color-picker-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="color-picker" />

依赖 Valar 的 Popover，CLI 会一并安装。

## 用法

```svelte
<script lang="ts">
  import { ColorPicker } from "$lib/components/ui/color-picker/index.js";
  let color = $state("#2563eb");
</script>

<ColorPicker
  label="主色"
  bind:value={color}
  presets={["#0f172a", "#2563eb"]}
/>
```

## 行为合同

- `value` 始终是小写六位十六进制 `#rrggbb`；外部传入的三位简写会被展开，无效值显示为 `#000000`。导出的 `normalizeHex` 可在其他地方复用同一规则。
- 弹层内提供浏览器原生色盘（Chromium 等浏览器自带取色器）、十六进制输入和可选预设色块，三者实时同步。
- 十六进制输入：输入满六位时立即生效；三位简写在 Enter 或失焦时展开生效；未完成的输入不会修改当前值，失焦后恢复为当前值。出现非十六进制字符时提示错误。
- 预设色块是带 `aria-pressed` 的按钮，当前颜色处于按下状态。弹层的打开、关闭、焦点归还和 Esc 行为来自 Bits UI Popover。
- 传入 `name` 时以 `#rrggbb` 参与原生表单提交。
- 当前不支持透明度、OKLCH／HSL 等其他色彩空间的直接编辑；原生色盘的外观由浏览器决定。
