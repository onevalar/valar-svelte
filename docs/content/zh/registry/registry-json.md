---
title: registry.json
description: 运行自定义组件注册表所用的 schema。
---

<script>
	import Callout from "$lib/components/callout.svelte";
</script>

`registry.json` schema 用于定义自定义组件注册表。

```json title="registry.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry.json",
  "name": "@valar/svelte-cli",
  "homepage": "http://127.0.0.1:5186",
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "files": [
        {
          "path": "src/lib/registry/blocks/hello-world/hello-world.svelte",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

## 定义

`registry.json` 的 JSON Schema 见[此处](/schema/registry.json)。

### $schema

`$schema` 属性指定 `registry.json` 文件使用的 schema。

```json title="registry.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry.json"
}
```

### name

`name` 属性指定注册表的名称。该名称用于 data 属性及其他元数据。

```json title="registry.json" showLineNumbers
{
  "name": "acme"
}
```

### homepage

注册表的主页。用于 data 属性及其他元数据。

```json title="registry.json" showLineNumbers
{
  "homepage": "https://acme.com"
}
```

### items

注册表中的 `items`。每一项都必须符合 [registry-item schema 规范](/schema/registry-item.json)。

```json title="registry.json" showLineNumbers
{
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "files": [
        {
          "path": "src/lib/registry/blocks/hello-world/hello-world.svelte",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

详见 [registry-item schema 文档](/docs/registry/registry-item-json)。

### aliases

`aliases` 定义用户安装组件时，注册表内部导入路径的转换方式。这些别名应与注册表代码中导入组件的方式一致。

例如，注册表中的组件使用以下导入：

```svelte
<script lang="ts">
  import { Button } from "@/lib/registry/ui/button/index.js";
  import { cn } from "@/lib/utils.js";
</script>
```

那么 `registry.json` 应配置与之对应的别名：

```json title="registry.json" showLineNumbers
{
  "aliases": {
    "lib": "@/lib", // Matches your internal imports
    "ui": "@/lib/registry/ui", // Matches your internal imports
    "components": "@/lib/registry/components", // Matches your internal imports
    "utils": "@/lib/utils", // Matches your internal imports
    "hooks": "@/lib/hooks" // Matches your internal imports
  }
}
```

用户安装组件时，这些路径会按他们的 `components.json` 配置转换。此处定义的别名是会被替换的“源”路径。

默认别名（未指定任何别名时）：

```json title="registry.json" showLineNumbers
{
  "aliases": {
    "lib": "$lib/registry/lib", // For internal library code
    "ui": "$lib/registry/ui", // For UI components
    "components": "$lib/registry/components", // For component-specific code
    "utils": "$lib/utils", // For utility functions
    "hooks": "$lib/registry/hooks" // For reactive state and logic (.svelte.js|ts)
  }
}
```

### overrideDependencies

`overrideDependencies` 用于强制指定依赖的版本范围，覆盖 `Valar Svelte registry build` 从 `package.json` 中检测到的结果。

常见用法：

- 使用最新的预发布版本：`"overrideDependencies": ["paneforge@next"]`
- 固定到指定版本：`"overrideDependencies": ["dep@1.5.0"]`

<Callout class="bg-blue-50 mt-6 border-blue-600 dark:border-blue-900 dark:bg-blue-950 mb-6 [&_code]:bg-blue-100 dark:[&_code]:bg-blue-900 text-foreground">

**警告**：覆盖依赖若管理不善，可能引发版本冲突。请尽量少用此选项。

</Callout>

转换示例：

```json
// Your registry's package.json
{
  "dependencies": {
    "paneforge": "1.0.0-next.1"
  }
}
```

用户安装组件时，将使用最新的 `@next` 版本，而不是 `1.0.0-next.1`。

```json
{
  "dependencies": {
    "paneforge": "1.0.0-next.1", // overrideDependencies: []
    "paneforge": "1.0.0-next.5" // overrideDependencies: ["paneforge@next"]
  }
}
```
