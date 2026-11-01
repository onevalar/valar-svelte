---
title: scroll-fade
description: 为滚动容器边缘添加渐隐效果的工具类。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
</script>

<ComponentPreview name="scroll-fade-demo">

<div></div>

</ComponentPreview>

## 安装

项目如果通过 `pnpm --filter @valar/svelte-cli start init` 初始化，则已经包含 `scroll-fade`。它随 `Valar Svelte` 包一起提供，CLI 会在全局 CSS 文件中导入。

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

| 类名                              | 样式                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `scroll-fade`                     | `mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));` <br /> `animation-timeline: scroll(self y);`       |
| `scroll-fade-y`                   | `mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));` <br /> `animation-timeline: scroll(self y);`       |
| `scroll-fade-x`                   | `mask-image: var(--scroll-fade-mask, var(--scroll-fade-inline));` <br /> `animation-timeline: scroll(self inline);` |
| `scroll-fade-t`                   | 顶部边缘的渐隐遮罩。 <br /> `animation-timeline: scroll(self y);`                                                   |
| `scroll-fade-b`                   | 底部边缘的渐隐遮罩。 <br /> `animation-timeline: scroll(self y);`                                                   |
| `scroll-fade-l`                   | 左侧边缘的渐隐遮罩。 <br /> `animation-timeline: scroll(self x);`                                                   |
| `scroll-fade-r`                   | 右侧边缘的渐隐遮罩。 <br /> `animation-timeline: scroll(self x);`                                                   |
| `scroll-fade-s`                   | 起始边缘的渐隐遮罩，在 RTL 下镜像。 <br /> `animation-timeline: scroll(self inline);`                               |
| `scroll-fade-e`                   | 结束边缘的渐隐遮罩，在 RTL 下镜像。 <br /> `animation-timeline: scroll(self inline);`                               |
| `scroll-fade-<number>`            | `--scroll-fade-size: calc(var(--spacing) * <number>);`                                                              |
| `scroll-fade-[<value>]`           | `--scroll-fade-size: <value>;`                                                                                      |
| `scroll-fade-{t,b,s,e}-<number>`  | `--scroll-fade-{t,b,s,e}-size: calc(var(--spacing) * <number>);`                                                    |
| `scroll-fade-{t,b,s,e}-[<value>]` | `--scroll-fade-{t,b,s,e}-size: <value>;`                                                                            |
| `scroll-fade-none`                | `--scroll-fade-mask: none;`                                                                                         |

给滚动容器加上 `scroll-fade` 或 `scroll-fade-y`，即带有 `overflow-y-auto` 的元素。

```svelte
<div class="scroll-fade overflow-y-auto"><!-- ... --></div>
```

渐隐跟随滚动位置变化：

- 静止时顶部边缘清晰，底部边缘渐隐，提示下方还有内容。
- 滚动过程中顶部出现渐隐，滚动到中途时两侧边缘都保持渐隐。
- 滚动到底部时底部边缘恢复清晰，表示已经到最后一项。

渐隐通过 `mask-image` 实现，溶解的是内容本身，而不是叠加一层颜色。遮罩使用从透明到黑色的线性渐变，无需配置即可适配任意背景。滚动区域位于卡片内时，把背景和边框放在外层容器上，`scroll-fade` 加在内部的滚动元素上，这样渐隐作用于内容，不会影响卡片。

[`ScrollArea`](/docs/components/scroll-area) 组件可以在其可滚动视口上使用 `scroll-fade`。

## 不溢出，不渐隐

内容没有溢出时不显示渐隐。任何列表都可以直接加上 `scroll-fade`，无需判断是否会滚动。

<ComponentPreview name="scroll-fade-overflow">

<div></div>

</ComponentPreview>

## 横向滚动

横向滚动的容器使用 `scroll-fade-x`，即带有 `overflow-x-auto` 的元素。

<ComponentPreview name="scroll-fade-horizontal">

<div></div>

</ComponentPreview>

```svelte
<div class="flex scroll-fade-x overflow-x-auto"><!-- ... --></div>
```

横向渐隐能感知书写方向。RTL 布局下，清晰边缘与渐隐边缘都跟随阅读方向，无需额外添加类名。`scroll-fade-<number>` 和 `scroll-fade-none` 在两个轴上的行为一致。

## 边缘渐隐

需要单侧边缘跟随滚动位置时，使用边缘工具类。

<ComponentPreview name="scroll-fade-edge">

<div></div>

</ComponentPreview>

```svelte
<div class="scroll-fade-b overflow-y-auto"><!-- ... --></div>
```

边缘工具类同样跟随滚动。离开起始位置后，起始边缘渐隐出现；滚动到末尾时，结束边缘的渐隐消失。物理边缘使用 `scroll-fade-t`、`scroll-fade-b`、`scroll-fade-l` 和 `scroll-fade-r`。逻辑行内边缘使用 `scroll-fade-s` 和 `scroll-fade-e`，在 RTL 下自动镜像。

## 渐隐尺寸

渐隐深度默认为容器的 `12%`，上限 `40px`，避免高滚动容器上的渐隐过重。需要固定值时，用 `scroll-fade-<number>` 按间距刻度设置，用法与 `scroll-mt-<number>` 相同。

<ComponentPreview name="scroll-fade-size">

<div></div>

</ComponentPreview>

```svelte
<div class="scroll-fade overflow-y-auto scroll-fade-24"><!-- ... --></div>
```

需要单独指定时，可传入任意长度或百分比：

```svelte
<div class="scroll-fade overflow-y-auto scroll-fade-[15%]"><!-- ... --></div>
```

两侧边缘需要不同的渐隐深度时，使用逐边修饰符 `scroll-fade-t-<number>`、`scroll-fade-b-<number>`、`scroll-fade-s-<number>` 和 `scroll-fade-e-<number>`。它们在对应边缘覆盖 `scroll-fade-<number>`，同样接受任意值。

```svelte
<div class="scroll-fade overflow-y-auto scroll-fade-b-8 scroll-fade-t-2">
  <!-- ... -->
</div>
```

横向滚动容器使用逻辑修饰符 `s`/`e`，尺寸才能在 RTL 下镜像。

渐隐不是瞬间出现，而是在一段固定的滚动距离内缓入缓出。这段距离由 `--scroll-fade-reveal` 变量控制，默认 `96px`，与渐隐深度无关。调小让出现更干脆，调大让过渡更平缓：

```svelte
<div class="scroll-fade overflow-y-auto [--scroll-fade-reveal:64px]">
  <!-- ... -->
</div>
```

## 关闭渐隐

用 `scroll-fade-none` 移除渐隐。它不受类名顺序影响，常见用法是配合响应式或状态切换：

```svelte
<div class="scroll-fade overflow-y-auto md:scroll-fade-none">
  <!-- ... -->
</div>
```

<ComponentPreview name="scroll-fade-none">

<div></div>

</ComponentPreview>

## 降级

跟随滚动的效果由 [CSS 滚动驱动动画](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)实现，不使用 JavaScript，也不注册滚动监听。不支持滚动驱动动画的浏览器中，`scroll-fade` 降级为两侧边缘的静态渐隐，边缘工具类则降级为所选边缘的静态渐隐。

遮罩作用在滚动容器本身，因此可见的滚动条会随内容在边缘一起渐隐。想完全隐藏滚动条，可与同一包内的 `no-scrollbar` 搭配。

## RTL

`scroll-fade-x` 跟随阅读方向。静止时起始边缘清晰，结束边缘渐隐。RTL 布局下即右侧清晰、左侧渐隐，与 LTR 相反。

<ComponentPreview name="scroll-fade-rtl">

<div></div>

</ComponentPreview>
