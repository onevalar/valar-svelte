---
title: 常见问题
description: 运行注册表时的常见问题。
---

## 常见问题

### 复杂组件是什么样子？

下面的示例是一个复杂组件，会安装一个页面、两个组件、一个 hook、一个日期格式化工具函数和一个配置文件。

```json showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    {
      "path": "registry/hello-world/page.svelte",
      "type": "registry:page",
      "target": "src/routes/hello/+page.svelte"
    },
    {
      "path": "registry/hello-world/components/hello-world.svelte",
      "type": "registry:component"
    },
    {
      "path": "registry/hello-world/components/formatted-message.svelte",
      "type": "registry:component"
    },
    {
      "path": "registry/hello-world/hooks/use-hello.svelte.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/hello-world/lib/format-date.ts",
      "type": "registry:utils"
    },
    {
      "path": "registry/hello-world/hello.config.ts",
      "type": "registry:file",
      "target": "hello.config.ts"
    }
  ]
}
```

### 如何新增 Tailwind 颜色？

新增颜色时，把它加到 `cssVars` 的 `light` 和 `dark` 键下。

```json showLineNumbers {10-18}
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    // ...
  ],
  "cssVars": {
    "light": {
      "brand-background": "20 14.3% 4.1%",
      "brand-accent": "20 14.3% 4.1%"
    },
    "dark": {
      "brand-background": "20 14.3% 4.1%",
      "brand-accent": "20 14.3% 4.1%"
    }
  }
}
```

CLI 会更新项目的 CSS 文件。更新后即可作为工具类使用：`bg-brand` 和 `text-brand-accent`。

### 如何新增或覆盖 Tailwind 主题变量？

新增或覆盖主题变量时，把它加到 `cssVars.theme` 下对应的键中。

```json showLineNumbers {10-15}
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    // ...
  ],
  "cssVars": {
    "theme": {
      "text-base": "3rem",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "font-heading": "Poppins, sans-serif"
    }
  }
}
```
