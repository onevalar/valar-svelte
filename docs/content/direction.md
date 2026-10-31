---
title: Direction / RTL
description: 原生方向继承、显式交互方向与 Portal 的组合规则。
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
</script>

<ComponentPreview name="direction-demo"><div></div></ComponentPreview>

## 不需要第二套 Provider

Valar Svelte 使用原生 `dir="rtl"` / `dir="ltr"` 与逻辑样式。Bits UI 2.20.0 没有 DirectionProvider，BitsConfig 只配置 locale 与 Portal 目标，**不会为所有组件统一设置方向**。上面的示例可动态切换，默认 RTL，代码块局部固定 LTR。

## 交互方向必须分类处理

| 组件                                | 方向来源                    | 用法                                                                     |
| ----------------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| Tabs、Stepper                       | 键盘时读取实际 DOM 计算方向 | 父节点设置 dir 即可，局部 dir 可覆盖                                     |
| Slider、ScrollArea                  | 原语显式 dir，默认 ltr      | 向组件传入与容器一致的 dir；Slider 同时影响数值几何和方向键              |
| DropdownMenu、ContextMenu、Menubar  | Root 的显式 dir             | 向 Root 传 dir；子菜单物理 side 单独设置 RTL left / LTR right            |
| Popover、Select、HoverCard、Tooltip | 浮动 Content 的方向与对齐   | Content 显式传 dir，再用 align="start" / "end"；不是只设置触发器的父节点 |

原生 `dir` 能继承，但 Portal 默认把 DOM 移到 body：Svelte context 保留，原父节点的 CSS 继承不保留。局部 RTL 的弹层必须显式指定方向，或通过既有 portalProps.to 移入正确方向的容器。不要把 align 的逻辑 start/end 与 side 的物理 left/right 混为一谈。

```svelte
<div dir={direction}>
  <Slider dir={direction} type="single" bind:value />
  <Popover.Root>
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Content dir={direction} align="start">Content</Popover.Content>
  </Popover.Root>
</div>
```

使用 `ms/me`、`ps/pe`、`text-start/end` 和 `inset-inline-*`。不是所有图标都应镜像：前进/后退/子菜单箭头应镜像，播放、商标、数字等不自动镜像。本轮修复 DropdownMenu、ContextMenu、Menubar 子菜单箭头的 `ms-auto rtl:rotate-180`；原有 `cn-rtl-flip` 标记本身并不产生镜像样式。现有逻辑弹层样式也**不代表全库每个组合都已 RTL 验收**。

## 范围与验收

本轮验收代表组合为继承方向的 Tabs、显式方向的 Slider、body Portal 的 Popover、嵌套菜单及局部 LTR 代码块，涵盖动态切换、键盘、逻辑对齐与 SSR 首屏。没有创建重复 Provider，也没有宣称现有所有业务区块、图表和第三方控件均已双向化。

固定版本源码依据、能力缺口和可重复结果见 `standards/porting-records/direction-bits-ui-to-svelte.md`。真实读屏、真实触摸设备及不同浏览器仍需集成项目按支持范围验证。
