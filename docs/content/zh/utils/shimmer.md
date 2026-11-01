---
title: shimmer
description: 为文本元素添加微光效果的工具类。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
</script>

<ComponentPreview name="shimmer-demo">

<div></div>

</ComponentPreview>

## 安装

项目如果通过 `pnpm --filter @valar/svelte-cli start init` 初始化，则已经包含 `shimmer`。它随 `Valar Svelte` 包一起提供，CLI 会在全局 CSS 文件中导入。

否则先安装 `Valar Svelte` 包：

```bash
npm install Valar Svelte
```

然后在全局 CSS 文件中导入共享工具类：

```css
@import "tailwindcss";
@import "@valar/svelte-cli/tailwind.css";
```

## 用法

| 类名                          | 样式                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `shimmer`                     | `background-clip: text;` <br /> `animation: tw-shimmer var(--shimmer-duration, 2s) linear infinite;` |
| `shimmer-once`                | `animation-iteration-count: 1;`                                                                      |
| `shimmer-reverse`             | `animation-direction: reverse;`                                                                      |
| `shimmer-none`                | `--shimmer-image: none;` <br /> `--shimmer-text-fill: currentColor;`                                 |
| `shimmer-color-<color>`       | `--shimmer-color: <color>;`                                                                          |
| `shimmer-color-[<value>]`     | `--shimmer-color: <value>;`                                                                          |
| `shimmer-color-<color>/<pct>` | `--shimmer-color: color-mix(in oklch, <color> <pct>, transparent);`                                  |
| `shimmer-duration-<number>`   | `--shimmer-duration: calc(<number> * 1ms);`                                                          |
| `shimmer-spread-<number>`     | `--shimmer-spread: calc(var(--spacing) * <number>);`                                                 |
| `shimmer-spread-[<value>]`    | `--shimmer-spread: <value>;`                                                                         |
| `shimmer-angle-<number>`      | `--shimmer-angle: calc(<number> * 1deg);`                                                            |

给文本元素加上 `shimmer`。

```svelte
<p class="shimmer text-muted-foreground">Generating response&hellip;</p>
```

微光基于 `currentColor`，会跟随元素自身颜色：

- 高光取自文本颜色，无需额外配置。
- 适用于任意颜色，从 `text-muted-foreground` 到品牌色。
- 深色模式下高光自动提亮，保持可见。

该效果完全由 CSS 实现。文本用 `background-clip: text` 绘制，高光在其上循环扫过，首尾衔接自然。

## 带标记

微光可与任何渲染文本的组件组合。常见做法是用[标记](/docs/components/marker)显示助手工作时的实时状态：

<ComponentPreview name="shimmer-marker">

<div></div>

</ComponentPreview>

```svelte
<Marker.Root role="status">
  <Marker.Icon>
    <Spinner />
  </Marker.Icon>
  <Marker.Content class="shimmer">Thinking&hellip;</Marker.Content>
</Marker.Root>
```

## 颜色

传入 `shimmer-color-<color>` 显式设置高光颜色。它接受带可选透明度修饰符的主题色，也接受任意颜色值。

<ComponentPreview name="shimmer-color">

<div></div>

</ComponentPreview>

```svelte
<p class="shimmer shimmer-color-blue-500/60">Generating response&hellip;</p>
<p class="shimmer shimmer-color-[#378ADD]">Generating response&hellip;</p>
```

## 时长

传入 `shimmer-duration-<number>` 设置单次扫光的时长，单位为毫秒。默认值为 `2000`，即 `2s`。

<ComponentPreview name="shimmer-duration">

<div></div>

</ComponentPreview>

```svelte
<p class="shimmer shimmer-duration-1000">Generating response&hellip;</p>
```

## 扩散范围

传入 `shimmer-spread-<number>`，按间距刻度设置光带宽度。默认值为 `calc(3ch + 40px)`：固定基数加上随字号缩放的 `3ch`。

<ComponentPreview name="shimmer-spread">

<div></div>

</ComponentPreview>

```svelte
<p class="shimmer shimmer-spread-24">Generating response&hellip;</p>
```

需要单次取值时，用任意长度或百分比：

```svelte
<p class="shimmer shimmer-spread-[5rem]">Generating response&hellip;</p>
```

## 角度

传入 `shimmer-angle-<number>` 设置光带的倾斜角度，单位为度。默认值为 `20`。

<ComponentPreview name="shimmer-angle">

<div></div>

</ComponentPreview>

```svelte
<p class="shimmer shimmer-angle-45">Generating response&hellip;</p>
```

## 反向

传入 `shimmer-reverse` 让高光反向扫过。RTL 布局下扫光本就跟随阅读方向，详见 [RTL](#rtl)。

```svelte
<p class="shimmer shimmer-reverse">Generating response&hellip;</p>
```

## 只播放一次

传入 `shimmer-once` 只播放一次扫光，不再循环，适合在流式输出结束时做一次揭示动画。可与 `shimmer-duration-<number>` 搭配，控制扫光时长。

<ComponentPreview name="shimmer-once">

<div></div>

</ComponentPreview>

```svelte
<p class="shimmer shimmer-duration-1100 shimmer-once">Response generated.</p>
```

## 关闭微光

传入 `shimmer-none` 关闭效果，文本按普通样式渲染。它不受类名顺序影响，常见用法是配合响应式或状态切换：

<ComponentPreview name="shimmer-none">

<div></div>

</ComponentPreview>

```svelte
<p class="shimmer md:shimmer-none">Generating response&hellip;</p>
```

## 降级

微光依赖现代颜色特性：[相对颜色语法](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)和 `color-mix()`，当前浏览器均已支持。不支持这些特性的旧浏览器中，高光渐变会失效，文本可能渲染为透明。需要兼容旧浏览器时，用 `supports-*` 变体有条件地添加 `shimmer`：

```svelte
<p class="supports-[color:oklch(from_white_l_c_h)]:shimmer">
  Generating response&hellip;
</p>
```

## 减少动态效果

用户启用减少动态效果时，动画自动关闭，文本按普通样式渲染，无需任何配置。

## RTL

扫光跟随阅读方向：LTR 下从左到右，RTL 下从右到左，无需额外类名。需要手动切换方向时用 `shimmer-reverse`。

<ComponentPreview name="shimmer-rtl">

<div></div>

</ComponentPreview>
