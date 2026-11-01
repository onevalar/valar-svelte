---
title: Registry
description: Valar Svelte 的源码分发服务。
---

Valar 的 registry 提供组件、区块、工具与主题的源码。CLI 将这些文件安装到目标项目，方便继续定制。

## 本地入口

当前入口为 `http://127.0.0.1:5186/registry`，每套样式位于 `styles/<style>`。例如：`/registry/styles/vega/button.json`。

## 构建

```sh
pnpm --filter docs build:registry
```

## 使用与扩展

按[安装指南](/docs/installation)使用仓库内的 CLI。扩展模板源码位于 `sv-addons/registry`，尚未作为公开 npm 插件发布。

自定义条目应符合[registry item schema](/docs/registry/registry-item-json)。当前没有公开 registry 域名，也不会自动回退到上游服务。
