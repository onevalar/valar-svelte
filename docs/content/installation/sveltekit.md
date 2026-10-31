---
title: SvelteKit
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

**运行初始化前，先在目标工程安装本地 CLI tarball**，因为生成的样式会引用 `@valar/svelte-cli/tailwind.css`。在 Valar 仓库构建并打包：

```sh
pnpm build:cli
pnpm --filter @valar/svelte-cli pack
```

随后在目标项目运行（替换绝对路径）：

```sh
pnpm add -D @valar/svelte-cli@file:/absolute/path/to/valar-svelte/packages/cli/valar-svelte-cli-0.1.0.tgz
pnpm exec valar-svelte init
pnpm exec valar-svelte add number-field tags-input stepper
```

初始化时可以使用 `--no-deps-install` 先写入配置；该选项不是免除依赖安装。CLI 与内部运行时包尚未发布，不能从 npm 下载同名包，registry 初始化也不会覆盖已安装的本地 CLI。

## Registry

默认只连接本地 Valar registry。其他地址可通过 `REGISTRY_URL` 环境变量设置，或在目标项目 components.json 的 registry 字段配置。请勿填写上游 registry，否则会安装上游版本。
