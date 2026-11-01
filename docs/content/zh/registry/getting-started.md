---
title: Getting Started
description: 构建 Valar Svelte 的本地 registry。
---

## 构建和预览

在 Valar 仓库中运行：

```sh
pnpm build:cli
pnpm --filter docs build:registry
pnpm --filter docs exec vite dev --host 127.0.0.1 --port 5186
```

默认样式的组件入口是 `http://127.0.0.1:5186/registry/styles/vega/button.json`。

## 使用组件

CLI 为仓库内的 `@valar/svelte-cli`，尚未发布。请按[安装指南](/docs/installation)准备目标项目，使用本地 CLI 安装组件。

## 部署状态

尚未设置正式 registry 域名。部署后应同时更新目标项目 components.json 与 CLI 默认地址；不要使用上游 registry 作为回退。
