---
title: 示例
description: "registry 条目示例：样式、组件、CSS 变量等。"
---

## registry:style

### 扩展 Valar Svelte 的自定义样式

以下 registry 条目是扩展 Valar 组件基线的自定义样式。执行 `pnpm --filter @valar/svelte-cli start init` 时会：

- 安装 `phosphor-svelte` 图标作为依赖。
- 向项目中添加 `login-01` 区块和 `calendar` 组件。
- 从远程 registry 添加 `editor`。
- 将 `font-sans` 变量设为 `Inter, sans-serif`。
- 在浅色和深色模式下安装 `brand` 颜色。

```json title="example-style.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "example-style",
  "type": "registry:style",
  "dependencies": ["phosphor-svelte"],
  "registryDependencies": [
    "login-01",
    "calendar",
    "https://example.com/r/editor.json"
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif"
    },
    "light": {
      "brand": "oklch(0.145 0 0)"
    },
    "dark": {
      "brand": "oklch(0.145 0 0)"
    }
  }
}
```

### 从零创建自定义样式

以下 registry 条目是一个不扩展 Valar Svelte 的自定义样式，见 `extends: none` 字段。

用来从零创建一套新样式，包括自定义组件、CSS 变量、依赖等。

执行 `pnpm --filter @valar/svelte-cli start add` 时会：

- 安装 `cn` 作为依赖。
- 从 Valar Svelte registry 添加 `utils` 条目。
- 从远程 registry 添加 `button`、`input`、`label` 和 `select` 组件。
- 安装新的 CSS 变量：`main`、`bg`、`border`、`text`、`ring`。

```json title="example-style.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "extends": "none",
  "name": "new-style",
  "type": "registry:style",
  "dependencies": ["cn"],
  "registryDependencies": [
    "utils",
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json",
    "https://example.com/r/select.json"
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif",
    }
    "light": {
      "main": "#88aaee",
      "bg": "#dfe5f2",
      "border": "#000",
      "text": "#000",
      "ring": "#000",
    },
    "dark": {
      "main": "#88aaee",
      "bg": "#272933",
      "border": "#000",
      "text": "#e6e6e6",
      "ring": "#fff",
    }
  }
}
```

## registry:theme

### 自定义主题

```json title="example-theme.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "light": {
      "background": "oklch(1 0 0)",
      "foreground": "oklch(0.141 0.005 285.823)",
      "primary": "oklch(0.546 0.245 262.881)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      "ring": "oklch(0.746 0.16 232.661)",
      "sidebar-primary": "oklch(0.546 0.245 262.881)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "sidebar-ring": "oklch(0.746 0.16 232.661)"
    },
    "dark": {
      "background": "oklch(1 0 0)",
      "foreground": "oklch(0.141 0.005 285.823)",
      "primary": "oklch(0.707 0.165 254.624)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      "ring": "oklch(0.707 0.165 254.624)",
      "sidebar-primary": "oklch(0.707 0.165 254.624)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "sidebar-ring": "oklch(0.707 0.165 254.624)"
    }
  }
}
```

### 自定义颜色

以下样式会基于 Valar Svelte 默认值初始化，再添加自定义的 `brand` 颜色。

```json title="example-style.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-style",
  "type": "registry:style",
  "cssVars": {
    "light": {
      "brand": "oklch(0.99 0.00 0)"
    },
    "dark": {
      "brand": "oklch(0.14 0.00 286)"
    }
  }
}
```

## registry:block

### 自定义区块

该条目从 Valar Svelte registry 安装 `login-01` 区块。

```json title="login-01.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "login-01",
  "type": "registry:block",
  "description": "A simple login form.",
  "registryDependencies": ["button", "card", "input", "label"],
  "files": [
    {
      "path": "blocks/login-01/page.svelte",
      "content": "import { LoginForm } ...",
      "type": "registry:page",
      "target": "src/routes/login/+page.svelte"
    },
    {
      "path": "blocks/login-01/components/login-form.svelte",
      "content": "...",
      "type": "registry:component"
    }
  ]
}
```

### 安装区块并覆盖基础组件

从 Valar Svelte registry 安装区块后，再用自定义的基础组件覆盖原有实现。

执行 `pnpm --filter @valar/svelte-cli start add` 时会：

- 从 Valar Svelte registry 添加 `login-01` 区块。
- 用远程 registry 中的实现覆盖 `button`、`input` 和 `label` 基础组件。

```json title="example-style.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-login",
  "type": "registry:block",
  "registryDependencies": [
    "login-01",
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json"
  ]
}
```

## CSS 变量

### 自定义主题变量

将自定义主题变量加到 `theme` 对象中。

```json title="example-theme.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "font-heading": "Inter, sans-serif",
      "shadow-card": "0 0 0 1px rgba(0, 0, 0, 0.1)"
    }
  }
}
```

### 覆盖 Tailwind CSS 变量

```json title="example-theme.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "spacing": "0.2rem",
      "breakpoint-sm": "640px",
      "breakpoint-md": "768px",
      "breakpoint-lg": "1024px",
      "breakpoint-xl": "1280px",
      "breakpoint-2xl": "1536px"
    }
  }
}
```

## 添加自定义 CSS

### 基础样式

```json title="example-base.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-style",
  "type": "registry:style",
  "css": {
    "@layer base": {
      "h1": {
        "font-size": "var(--text-2xl)"
      },
      "h2": {
        "font-size": "var(--text-xl)"
      }
    }
  }
}
```

### 组件

```json title="example-card.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-card",
  "type": "registry:component",
  "css": {
    "@layer components": {
      "card": {
        "background-color": "var(--color-white)",
        "border-radius": "var(--rounded-lg)",
        "padding": "var(--spacing-6)",
        "box-shadow": "var(--shadow-xl)"
      }
    }
  }
}
```

## 添加自定义工具类

### 简单工具类

```json title="example-component.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility content-auto": {
      "content-visibility": "auto"
    }
  }
}
```

### 复杂工具类

```json title="example-utility.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility scrollbar-hidden": {
      "scrollbar-hidden": {
        "&::-webkit-scrollbar": {
          "display": "none"
        }
      }
    }
  }
}
```

### 函数式工具类

```json title="example-functional.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility tab-*": {
      "tab-size": "var(--tab-size-*)"
    }
  }
}
```

## 添加自定义动画

要使用动画，需要同时在 CSS 中定义 `@keyframes`，并在 cssVars 中定义 `theme`。

```json title="example-component.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "cssVars": {
    "theme": {
      "--animate-wiggle": "wiggle 1s ease-in-out infinite"
    }
  },
  "css": {
    "@keyframes wiggle": {
      "0%, 100%": {
        "transform": "rotate(-3deg)"
      },
      "50%": {
        "transform": "rotate(3deg)"
      }
    }
  }
}
```
