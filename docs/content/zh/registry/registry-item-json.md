---
title: registry-item.json
description: 注册表项的规范。
---

`registry-item.json` schema 用于定义自定义注册表项。

```json title="registry-item.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A simple hello world component.",
  "files": [
    {
      "path": "registry/hello-world/hello-world.svelte",
      "type": "registry:component"
    },
    {
      "path": "registry/hello-world/use-hello-world.svelte.ts",
      "type": "registry:hook"
    }
  ],
  "cssVars": {
    "theme": {
      "font-heading": "Poppins, sans-serif"
    },
    "light": {
      "brand": "20 14.3% 4.1%"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

<div class="flex gap-2 items-center mt-6">

[查看更多示例](/docs/registry/examples)

</div>

## 定义

`registry-item.json` 的 JSON Schema 见[此处](/schema/registry-item.json)。

### $schema

`$schema` 属性指定 `registry-item.json` 文件使用的 schema。

```json title="registry-item.json" showLineNumbers
{
  "$schema": "http://127.0.0.1:5186/schema/registry-item.json"
}
```

### name

注册表项的名称。用于在注册表中标识该项，在同一注册表内应保持唯一。

```json title="registry-item.json" showLineNumbers
{
  "name": "hello-world"
}
```

### title

注册表项的可读标题。简短，并能说明用途。

```json title="registry-item.json" showLineNumbers
{
  "title": "Hello World"
}
```

### description

注册表项的描述，可以比 `title` 更长、更详细。

```json title="registry-item.json" showLineNumbers
{
  "description": "A simple hello world component."
}
```

### type

`type` 属性指定注册表项的类型。项目解析该项时，据此确定其类型和目标路径。

```json title="registry-item.json" showLineNumbers
{
  "type": "registry:block"
}
```

支持以下类型：

| 类型                 | 说明                              |
| -------------------- | --------------------------------- |
| `registry:block`     | 用于包含多个文件的复杂组件。      |
| `registry:component` | 用于简单组件。                    |
| `registry:lib`       | 用于 lib 和工具函数。             |
| `registry:hook`      | 用于 hook。                       |
| `registry:ui`        | 用于 UI 组件和单文件基础组件。    |
| `registry:page`      | 用于页面或基于文件的路由。        |
| `registry:file`      | 用于其他文件。                    |
| `registry:style`     | 用于注册表样式，例如 `new-york`。 |
| `registry:theme`     | 用于主题。                        |

### author

`author` 属性指定注册表项的作者。

作者可以只属于该项，也可以与注册表作者相同。

```json title="registry-item.json" showLineNumbers
{
  "author": "John Doe <john@doe.com>"
}
```

### dependencies

`dependencies` 属性指定注册表项的依赖，这些依赖是 `npm` 包。

用 `@version` 指定依赖的版本。

```json title="registry-item.json" showLineNumbers
{
  "dependencies": ["bits-ui", "zod", "@lucide/svelte", "name@1.0.2"]
}
```

### registryDependencies

定义该项依赖的其他注册表项。

每一项可以是以下形式之一：

#### Valar Svelte 注册表项

Valar Svelte 注册表项的名称（例如 `'button'`、`'input'`、`'select'`），会解析为 Valar Svelte 注册表中的对应项。

```json title="registry-item.json" showLineNumbers
{
  "registryDependencies": ["button", "input", "select"]
}
```

#### 远程 URL

自定义注册表项的完整 URL（例如 `https://example.com/r/hello-world.json`）。

```json title="registry-item.json" showLineNumbers
{
  "registryDependencies": ["https://example.com/r/hello-world.json"]
}
```

#### 本地别名（使用 CLI 构建时）

在 `registry.json` 中定义项，并用 CLI 构建注册表时，可以用带 `local:` 前缀的名称（例如 `local:stepper`）引用当前注册表中的项。CLI 会在输出的 `registry-item.json` 文件中把它转换为相对路径（例如 `./stepper.json`）。

```json title="registry.json" showLineNumbers
{
  "items": [
    {
      "name": "hello-world",
      "registryDependencies": ["local:stepper"]
    }
  ]
}
```

CLI 会在输出的 `registry-item.json` 文件中把它转换为以下内容：

```json title="registry-item.json" showLineNumbers
{
  "registryDependencies": ["./stepper.json"]
}
```

#### 相对路径

不使用 CLI，直接在 `registry-item.json` 文件中定义项时，可以用相对路径引用注册表中的其他项，路径相对于当前项（例如 `./stepper.json`）。

```json title="registry-item.json" showLineNumbers
{
  "registryDependencies": ["./stepper.json"]
}
```

### files

`files` 属性指定注册表项包含的文件。每个文件有 `path`、`type` 和可选的 `target` 属性。

**`registry:page` 和 `registry:file` 类型必须提供 `target` 属性。**

```json title="registry-item.json" showLineNumbers
{
  "files": [
    {
      "path": "registry/hello-world/page.svelte",
      "type": "registry:page",
      "target": "src/routes/hello/+page.svelte"
    },
    {
      "path": "registry/hello-world/hello-world.svelte",
      "type": "registry:component"
    },
    {
      "path": "registry/hello-world/use-hello-world.svelte.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/hello-world/.env",
      "type": "registry:file",
      "target": ".env"
    }
  ]
}
```

#### path

`path` 属性指定文件在注册表中的路径。构建脚本用它解析、转换文件，并生成注册表 JSON 数据。

#### type

`type` 属性指定文件的类型。详见 [type](#type) 一节。

#### target

`target` 属性指明文件在项目中的放置位置。该属性可选，只有 `registry:page` 和 `registry:file` 类型需要。

默认情况下，`Valar Svelte` CLI 会读取项目的 `components.json` 文件来确定目标路径。路由、配置等文件可以手动指定目标路径。

用 `~` 表示项目根目录，例如 `~/foo.config.js`。

### cssVars

用 `cssVars` 为注册表项定义 CSS 变量。

```json title="registry-item.json" showLineNumbers
{
  "cssVars": {
    "theme": {
      "font-heading": "Poppins, sans-serif"
    },
    "light": {
      "brand": "20 14.3% 4.1%",
      "radius": "0.5rem"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

### css

用 `css` 向项目的 CSS 文件添加新规则，例如 `@layer base`、`@layer components`、`@utility`、`@keyframes` 等。

```json title="registry-item.json" showLineNumbers
{
  "css": {
    "@layer base": {
      "body": {
        "font-size": "var(--text-base)",
        "line-height": "1.5"
      }
    },
    "@layer components": {
      "button": {
        "background-color": "var(--color-primary)",
        "color": "var(--color-white)"
      }
    },
    "@utility text-magic": {
      "font-size": "var(--text-base)",
      "line-height": "1.5"
    },
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

### docs

通过 CLI 安装注册表项时，用 `docs` 显示自定义文档或提示信息。

```json title="registry-item.json" showLineNumbers
{
  "docs": "Remember to add the FOO_BAR environment variable to your .env file."
}
```

### categories

用 `categories` 归类注册表项。

```json title="registry-item.json" showLineNumbers
{
  "categories": ["sidebar", "dashboard"]
}
```

### meta

用 `meta` 为注册表项添加额外元数据。任意键值对都可以加入，供该项使用。

```json title="registry-item.json" showLineNumbers
{
  "meta": { "foo": "bar" }
}
```
