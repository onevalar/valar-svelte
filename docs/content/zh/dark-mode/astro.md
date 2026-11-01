---
title: Astro
description: 为 Astro 站点添加深色模式。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
</script>

与普通 Svelte 项目一样，这里使用 Tailwind CSS 的 `class` 策略支持深色模式切换。详见 [Tailwind CSS 文档](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually)。

把 `dark` 类加到 `html` 元素的方式由你决定。本指南用 [mode-watcher](https://github.com/svecosystem/mode-watcher) 开启深色模式切换。

## 用法

<Steps>

### 创建内联主题脚本

这个脚本负责在 `localStorage` 中保存并跟踪深色模式的取值，同时避免 [FUOC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content)（无样式内容闪烁）。

```astro title="src/pages/index.astro" {5-27} showLineNumbers
---
import "../styles/global.css";
---

<script is:inline>
  const isBrowser = typeof localStorage !== 'undefined';
  const getThemePreference = () => {
    if (isBrowser && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  };
  const isDark = getThemePreference() === 'dark';
  document.documentElement.classList[isDark ? 'add' : 'remove']('dark');

  if (isBrowser) {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
</script>

<html lang="en">
	<body>
      <h1>Astro</h1>
	</body>
</html>
</script>
```

### 安装 mode-watcher

<PMInstall command="mode-watcher@0.5.1" />

### 添加 ModeWatcher 组件

导入 `ModeWatcher` 组件，用 `client:load` 指令在页面中使用：

```astro title="src/pages/index.astro" {3,9} showLineNumbers
---
import "../styles/global.css";
import { ModeWatcher } from "mode-watcher";
---

<!-- inline-script -->
<html lang="en">
	<body>
      <h1>Astro</h1>
      <ModeWatcher client:load />
	</body>
</html>
```

### 创建模式切换控件

在站点中创建模式切换控件，用于在浅色与深色模式之间切换：

#### 切换开关

<ComponentPreview name="dark-mode-light-switch">

<div></div>

</ComponentPreview>

#### 下拉菜单

<ComponentPreview name="dark-mode-dropdown-menu">

<div></div>

</ComponentPreview>

### 将模式切换控件添加到页面

把模式切换控件加到页面中（同样使用 `client:load` 指令）：

```astro title="src/pages/index.astro" {4,12} showLineNumbers
---
import "../styles/global.css";
import { ModeWatcher } from "mode-watcher";
import ModeToggle from "$lib/components/mode-toggle.svelte";
---

<!-- inline-script -->
<html lang="en">
	<body>
      <h1>Astro</h1>
      <ModeWatcher client:load />
      <ModeToggle client:load />
	</body>
</html>
```

</Steps>
