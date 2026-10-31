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

## AI 与设计规范

组件自带设计规范：带规范的组件（目前是 Button 和 Field）会把 `RULES.md` 一起装进组件目录，每次 `add` 后 CLI 会把全部已装组件的规范，连同通用的颜色、圆角规则，写进项目根目录 `AGENTS.md` 中的托管区块。大多数 AI 编程工具开始工作时会自动读取 `AGENTS.md`，因此不需要另找设计文档。区块外的内容保持不变；区块内容会在下次安装时重写，请勿手改。

写完界面后运行检查，发现 error 时命令失败，可直接加入 CI：

```sh
pnpm exec valar-svelte lint        # 默认检查 src，跳过已安装的组件源码
```

目前检查：非语义颜色（`valar/semantic-color`）、像素任意值（`valar/no-arbitrary-px`）、Button 用 class 改尺寸（`valar/button-size-via-prop`）、图标按钮缺少名称（`valar/icon-button-label`）、原生 `<button>`（`valar/use-button-component`）和缺少标签的输入框（`valar/input-label`）。规则基于文本匹配，可能有漏报或误报；警告不会使命令失败。

### 给 AI 的组件资料与 MCP

常用组件（目前 20 个）带有说明卡：用途、何时用、何时不用（改用哪个组件）、无障碍与响应式注意事项、相关组件。说明卡是唯一来源，下面这些资料都从它生成：

- `/llms-small.txt`：每个组件一行的索引；`/llms-full.txt`：全部文档合成一个文件；`/llms.txt`：文档目录。
- `/docs/components/<组件>.md`：顶部是说明卡，下面是完整文档。
- `/registry/catalog.json`：机器可读的组件目录，`missingCards` 列出尚无说明卡的组件。
- Valar 技能包：仓库 `skills/valar-svelte`，告诉 AI 先查组件、再安装、按规范编写、最后 lint。页面组合、文案、动效部分由维护者编写，目前为占位。

本地 MCP 服务（只读，无需登录）让 AI 工具直接查询组件。在 AI 工具的 MCP 配置中添加：

```json
{
  "mcpServers": {
    "valar-svelte": {
      "command": "pnpm",
      "args": ["exec", "valar-svelte", "mcp"]
    }
  }
}
```

提供 `list_components`、`search_components`、`get_component`、`get_install_command`、`get_skill`。数据默认来自 components.json 的 registry（需要文档站在运行）；没有运行文档站时，可用 `--registry <Valar 仓库>/docs/static/registry` 直接读取本地文件。目前只有本地版，线上版待部署站点后提供。

## Registry

默认只连接本地 Valar registry。其他地址可通过 `REGISTRY_URL` 环境变量设置，或在目标项目 components.json 的 registry 字段配置。请勿填写上游 registry，否则会安装上游版本。
