# Valar / Svelte

Valar 是个人组件库系列品牌，Svelte 是当前的框架实现。React、Vue 实现尚未提供。

本项目在完整技术基线上独立维护组件、文档、CLI 和 registry。组件样式目前保持导入时的基线；本轮完成品牌、内容和分发配置的独立化。

## 开发

```sh
source ~/.nvm/nvm.sh
nvm use
npx --yes pnpm@12.14.0 install --frozen-lockfile
npx --yes pnpm@12.14.0 dev
```

当前本地预览为 http://127.0.0.1:5186 。生成内容就绪后可单独启动：

```sh
pnpm --filter docs exec vite dev --host 127.0.0.1 --port 5186 --strictPort
```

## 源码目录

- `docs/src/lib/registry/ui/`：66 个基础组件目录。
- `docs/src/lib/registry/examples/`、`blocks/`：示例与组合区块。
- `docs/src/lib/registry/styles/`：8 套现有组件样式。
- `docs/content/`：Valar 文档与组件用法。
- `packages/cli/`：`@valar/svelte-cli`，命令名 `valar-svelte`。
- `packages/primitives/`：`@valar/svelte-primitives`。
- `packages/parity/`：内部对照工具。
- `sv-addons/`：内部扩展模板，尚未发布。

## 分发状态

全部自有工作区包保持 private，尚未发布到 npm。默认 registry 为 `http://127.0.0.1:5186/registry`；可以通过目标项目 components.json 或 REGISTRY_URL 指定新的 Valar 地址。未配置生产域名。

从仓库根目录向目标项目安装组件：

```sh
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app --no-deps-install
```

目标项目先按站内安装说明初始化 Svelte 5、Tailwind CSS 4 和 components.json。自有运行时包通过 `pnpm --filter @valar/svelte-cli pack` 与 `pnpm --filter @valar/svelte-primitives pack` 生成本地 tarball 后安装；不能从 npm 下载尚未发布的包。随后安装组件实际需要的第三方依赖。

## 核验命令

```sh
pnpm build:cli
pnpm --filter @valar/svelte-cli check
pnpm --filter docs check
pnpm build
```

## 来源与归档

技术基线来自 shadcn-svelte 的 main 提交 `fe4b0ad3b8b30c6745346db008c3307b5afeabb1`，于 2026-10-30 导入全部 6,132 个跟踪文件。原始文件摘要见 `upstream-source-manifest.json`，原始说明见 `UPSTREAM_README.md`。品牌独立不改变上游 MIT 许可及版权要求，相关声明继续保留。

`_archive/initial-starter/` 保留早期四组件工程；`_archive/upstream-branding/` 保留上游宣传历史、品牌素材和自动工作流。这些目录不属于运行中的站点或 pnpm workspace。

上游广告、赞助、社群、统计入口已移除；原作者宣传不再作为 Valar 页面内容。第三方依赖的技术文档链接仍按实际使用保留。上游发布、部署工作流已退出活动目录。本版本作为 Valar Svelte 后续深度定制的 Git 基础版本保存；尚未发布 npm 包或部署网站。

## 本轮验证（2026-10-30）

- CLI 与基础包构建、整站生产构建通过；CLI 与文档类型检查通过（文档零错误、零警告）。
- 11 项分发前置检查测试通过；冻结锁文件离线校验通过。
- 本地 CLI 从 Valar registry 向临时目标项目成功安装 Button。
- 首页、文档、Button、Dialog、更新记录和配置页抽查通过；Dialog 开关、手机宽度和深色切换通过。
- 抽查网络请求未发现上游广告、统计或 registry 请求。
- 462 个基础组件文件除内部包命名空间替换外未变化，8 套组件样式 CSS 与导入基线一致，许可证文件保持原样。
