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

## 设计师调参工作台

站点导航 **Studio**（`/workbench`）提供中文参数面板与真实组件画布，支持草稿、具名版本、撤销重做、导入及可安装预设导出，手机上可切换预览和参数页签。

首批接入 Button、Dialog、Tooltip、Accordion，共 65 个全局／组件参数；其余 62 个组件仍待逐项接入，不代表全库或每一个 API 已覆盖。设计师操作、开发者安装、能力边界和后续顺序见[工作台说明](standards/WORKBENCH.md)。保存仅发生在当前浏览器；导出不等于发布或部署。

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

### 浏览器与独立安装回归

```sh
pnpm --filter docs exec playwright install --with-deps chromium
pnpm build
pnpm --filter docs test:e2e
```

浏览器回归会启动临时生产预览服务器，检查 Slider 的可访问名称、表单重置和 Enter 提交、Stepper 异步失败／取消、搜索按需加载与失败重试，以及 320／390／768px 文档布局与触摸导航。最后一项会打包实际 CLI，在工作区之外创建 SvelteKit 消费者，执行 init／add、严格第三方类型检查、生产构建和浏览器表单检查，结束后清理临时项目。不会发布包或部署。消费者显式带入类型补丁与 pnpm 兼容配置，步骤见站内安装说明的“严格检查第三方类型”。

复用已运行的文档站时可设置 `E2E_BASE_URL`；单独执行消费者检查时使用 `pnpm --filter docs test:consumer`，通过 `REGISTRY_URL` 指定正在运行的 registry。默认地址仍是本地开发 registry。

自有 GitHub CI 在 main push 和 pull request 时执行冻结安装、单元测试、工作区类型检查、整站构建和上述浏览器／消费者回归；只读仓库权限，没有发布或部署步骤。

本轮手机适配、无障碍、持续回归、类型兼容与加载优化的结果和限制见[六项优化验收记录](standards/porting-records/optimization-2026-10-31.md)。

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
