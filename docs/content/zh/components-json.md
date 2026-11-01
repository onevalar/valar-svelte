---
title: components.json
description: 项目的配置文件。
---

<script>
	import Callout from "$lib/components/callout.svelte";
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMExecute from "$lib/components/pm-execute.svelte";
</script>

`components.json` 文件保存项目配置。

CLI 通过该文件了解项目的组织方式，并据此生成适配项目的组件。

<Callout class="mt-6">

注意：`components.json` 文件可选，**仅在使用 CLI** 向项目添加组件时才需要。使用复制粘贴的方式则不需要该文件。

</Callout>

运行以下命令在项目中创建 `components.json` 文件：

<PMExecute command="@valar/svelte-cli init" />

详见 [CLI](/docs/cli)。

## $schema

`components.json` 的 JSON Schema 见[此处](http://127.0.0.1:5186/schema.json)。

```json title="components.json"
{
  "$schema": "http://127.0.0.1:5186/schema.json"
}
```

## tailwind

帮助 CLI 了解项目中 Tailwind CSS 配置方式的设置。

Tailwind CSS 的配置方式见[安装](/docs/installation)。

### tailwind.css

在项目中引入 Tailwind CSS 的 CSS 文件路径。

```json title="components.json"
{
  "tailwind": {
    "css": "src/app.{p,post}css"
  }
}
```

### tailwind.baseColor

用于生成组件的默认调色板。**初始化后无法更改。**

```json title="components.json"
{
  "tailwind": {
    "baseColor": "gray" | "neutral" | "slate" | "stone" | "zinc"
  }
}
```

## aliases

CLI 结合这些值以及 `svelte.config.js` 中的 `alias` 配置，把生成的组件放到正确位置。

路径别名需要在 `svelte.config.js` 中配置。

### aliases.lib

库的导入别名，_通常_用于存放组件、工具函数、hooks 等。

```json title="components.json"
{
  "aliases": {
    "lib": "$lib"
  }
}
```

### aliases.utils

工具函数的导入别名。

```json title="components.json"
{
  "aliases": {
    "utils": "$lib/utils"
  }
}
```

### aliases.components

组件的导入别名。

```json title="components.json"
{
  "aliases": {
    "components": "$lib/components"
  }
}
```

### aliases.ui

UI 组件的导入别名。

```json title="components.json"
{
  "aliases": {
    "ui": "$lib/components/ui"
  }
}
```

### aliases.hooks

hooks 的导入别名。在 Svelte 5 中，hooks 是响应式的函数或类，所在文件通常以 `.svelte.ts` 或 `.svelte.js` 结尾。

```json title="components.json"
{
  "aliases": {
    "hooks": "$lib/hooks"
  }
}
```

## Typescript

开启或关闭 Typescript 支持。

```json title="components.json"
{
  "typescript": true | false
}
```

如果自定义 Typescript 配置文件的名称不是 `tsconfig.json` 或 `jsconfig.json`，或者文件位于其他目录，也可以指定它的路径：

```json title="components.json"
{
  "typescript": {
    "config": "path/to/tsconfig.custom.json"
  }
}
```

## Registry

registry URL 指定 CLI 从何处获取 Valar Svelte 的组件与注册表。可以固定到某个预览版本，也可以指向自己 fork 的注册表。

```json title="components.json"
{
  "registry": "http://127.0.0.1:5186/registry"
}
```
