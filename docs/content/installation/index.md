---
title: Installation
description: Install and use the Valar Svelte source locally.
---

## Prepare the repository

```sh
git clone https://github.com/onevalar/valar-svelte.git
cd valar-svelte
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

These commands assume the repository is already in sync. The source lives in the current `valar-svelte` directory. The CLI package is `@valar/svelte-cli`, which has not been published to npm.

## Install components in your project

Your project needs Svelte 5 and Tailwind CSS 4 installed. Start the local docs site and registry first (currently at `http://127.0.0.1:5186`), then run the following from the root of the Valar repository:

```sh
pnpm --filter @valar/svelte-cli start init --cwd /absolute/path/to/your-app
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app
```

When initializing, you can pass `--no-deps-install` to write the config first. The `@valar/svelte-cli/tailwind.css` file that the CLI injects also comes from this repository. Until the package is published, run `pnpm --filter @valar/svelte-cli pack` to build a local tarball and install that file in your project. Do not download a package of the same name from npm.

## 严格检查第三方类型

需要设置 `skipLibCheck: false` 的 pnpm 消费者，请一并使用仓库的类型兼容配置。当前验收组合为 Svelte 5.57.2、TypeScript 5.9.3、Bits UI 2.20.0 和 svelte-toolbelt 0.10.6：

1. 将仓库 `patches/bits-ui@2.20.0.patch` 和 `patches/svelte-toolbelt@0.10.6.patch` 复制到目标项目的同名路径。
2. 将 `docs/e2e/fixtures/pnpm-workspace.yaml` 中的 `overrides`、`patchedDependencies` 和 `packageExtensions` 合并到目标项目的 `pnpm-workspace.yaml`。不要覆盖项目已有的其他配置。
3. 声明 `bits-ui: "2.20.0"` 依赖并安装 `@types/node`；在 tsconfig 的 `compilerOptions` 中设置 `strict: true`、`skipLibCheck: false`、`types: ["node"]`，然后执行 `pnpm install` 和项目的 check／build。

补丁只修复两处生成声明的类型复杂度问题，以及一个遗漏的类型导入；没有修改运行时、移除属性或放宽类型。`packageExtensions` 补齐声明引用但原包没有声明的 csstype 3.1.3。CLI 不会自动改写消费者的包管理器配置，这些文件需要显式带入；`test:consumer` 会从工作区外验证这一完整路径。

升级上述第三方包后应重新验证并移除已由上游修复的补丁，不应把补丁套用到未验证的版本。这里不代表所有第三方依赖、所有版本和整个文档工具链都已通过 `skipLibCheck: false`。

## Registry

By default the CLI only connects to the local Valar registry. To use another URL, set the `REGISTRY_URL` environment variable or the `registry` field in your project's `components.json`. Do not point it at the upstream registry, or you will install the upstream versions.
