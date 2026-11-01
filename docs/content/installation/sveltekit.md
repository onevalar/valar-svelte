---
title: SvelteKit
description: Install and use the local Valar Svelte source.
---

## Prepare the repository

```sh
git clone https://github.com/onevalar/valar-svelte.git
cd valar-svelte
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

These commands assume your checkout is already in sync. The local source lives in the current `valar-svelte` directory. The CLI package is called `@valar/svelte-cli` and has not been published to npm.

## Install components in your project

Your project needs Svelte 5 and Tailwind CSS 4. Start the local docs site and registry (currently at `http://127.0.0.1:5186`), then run the following from the root of the Valar repository:

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

组件自带设计规范：每个组件都会把 `RULES.md` 一起装进组件目录，每次 `add` 后 CLI 会把全部已装组件的规范，连同通用的颜色、圆角规则，写进项目根目录 `AGENTS.md` 中的托管区块。大多数 AI 编程工具开始工作时会自动读取 `AGENTS.md`，因此不需要另找设计文档。区块外的内容保持不变；区块内容会在下次安装时重写，请勿手改。

写完界面后运行检查，发现 error 时命令失败，可直接加入 CI：

```sh
pnpm exec valar-svelte lint        # 默认检查 src，跳过已安装的组件源码
```

目前检查（error 使命令失败，warning 只提示）：

| 规则                           | 级别    | 检查内容                                                                                                                                                                                                                       |
| ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `valar/semantic-color`         | error   | 调色板色值、黑白、十六进制颜色类                                                                                                                                                                                               |
| `valar/no-arbitrary-px`        | warning | `h-[37px]` 这类像素任意值                                                                                                                                                                                                      |
| `valar/motion-token`           | warning | 写死的动效时长、曲线                                                                                                                                                                                                           |
| `valar/button-size-via-prop`   | error   | 用 class 改 Button、AlertDialog.Action／Cancel、InputGroup.Button、Attachment.Action 的尺寸或圆角                                                                                                                              |
| `valar/icon-button-label`      | error   | 只有图标的 Button、InputGroup.Button、Attachment.Action，以及 Attachment.Trigger 缺少 `aria-label`                                                                                                                             |
| `valar/use-button-component`   | warning | 原生 `<button>`                                                                                                                                                                                                                |
| `valar/use-form-component`     | warning | 原生 `<input>`（`type="hidden"` 除外）、`<textarea>`、`<select>`                                                                                                                                                               |
| `valar/input-label`            | warning | Input、Textarea、InputGroup.Input／Textarea、NumberField、TagsInput、Select.Trigger、NativeSelect、Checkbox、Switch、RadioGroup.Item 既无 `id` 也无 `aria-label`；Slider 缺少 `aria-label`、`aria-labelledby` 或 `thumbLabels` |
| `valar/invalid-via-aria`       | warning | 在上述表单控件上直接写 `border-destructive` 等错误样式，而不是设 `aria-invalid`                                                                                                                                                |
| `valar/overlay-title`          | error   | Dialog、AlertDialog、Sheet、Drawer 的 Content 所在文件没有对应的 Title（Content 自带 `aria-label` 时除外）                                                                                                                     |
| `valar/alert-dialog-cancel`    | warning | AlertDialog 没有 AlertDialog.Cancel                                                                                                                                                                                            |
| `valar/trigger-child-snippet`  | error   | Dialog、Popover、Tooltip、Dropdown Menu 等会渲染 `<button>` 的 Trigger 里直接放 Button 或链接，而没有用 `child` snippet                                                                                                        |
| `valar/tooltip-no-interactive` | warning | Tooltip.Content 中有按钮、链接或输入框                                                                                                                                                                                         |
| `valar/image-alt`              | error   | `<img>`、Avatar.Image 缺少 `alt`                                                                                                                                                                                               |
| `valar/chart-color-token`      | warning | 图表配置（含 `ChartConfig` 的文件）中的固定色值                                                                                                                                                                                |

规则基于单个文件的文本匹配，可能有漏报或误报：例如标题放在另一个组件文件里时，`valar/overlay-title` 会误报；用 Label 包住 Checkbox 时，`valar/input-label` 会误报。

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

By default the CLI only connects to the local Valar registry. To use a different address, set the `REGISTRY_URL` environment variable or the `registry` field in your project's `components.json`. Don't point it at the upstream registry, or you'll end up installing upstream versions.
