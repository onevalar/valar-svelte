---
title: JavaScript
description: 在 JavaScript 中使用 Valar Svelte。
---

本项目及组件使用 TypeScript 编写。建议你的项目也使用 TypeScript。

不过，组件也提供 JavaScript 版本。JavaScript 版本仅通过 [CLI](/docs/cli) 提供。

不想用 TypeScript，可以在 `components.json` 文件中关闭 `typescript` 选项。

```json {6} title="components.json" showLineNumbers
{
  "style": "default",
  "tailwind": {
    "css": "src/routes/layout.css"
  },
  "typescript": false,
  "aliases": {
    "utils": "$lib/utils",
    "components": "$lib/components",
    "hooks": "$lib/hooks",
    "ui": "$lib/components/ui"
  },
  "registry": "http://127.0.0.1:5186/registry"
}
```

要配置导入别名，创建 `jsconfig.json` 文件：

```json {4} title="jsconfig.json" showLineNumbers
{
  "compilerOptions": {
    "paths": {
      "$lib/*": ["./src/lib/*"]
    }
  }
}
```
