---
title: Vite
description: 安装和使用 Valar Svelte 的本地源码。
---

## 准备仓库

```sh
git clone https://github.com/onevalar/valar-svelte.git
cd valar-svelte
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

这些命令适用于仓库已同步后的环境。本地源码在当前 valar-svelte 目录中。CLI 包名为 `@valar/svelte-cli`，尚未发布到 npm。

## 在目标项目安装组件

目标项目需已安装 Svelte 5 和 Tailwind CSS 4。先启动本地文档站与 registry（当前地址 `http://127.0.0.1:5186`），在 Valar 仓库根目录运行：

```sh
pnpm --filter @valar/svelte-cli start init --cwd /absolute/path/to/your-app
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app
```

初始化时可以使用 `--no-deps-install` 先写入配置。CLI 注入的 `@valar/svelte-cli/tailwind.css` 也由本仓库提供；在包正式发布前，先运行 `pnpm --filter @valar/svelte-cli pack` 生成本地 tarball，并在目标项目安装该文件，不能从 npm 下载同名包。

## 注册表

默认只连接本地 Valar registry。其他地址可通过 `REGISTRY_URL` 环境变量设置，或在目标项目 components.json 的 registry 字段配置。请勿填写上游 registry，否则会安装上游版本。
