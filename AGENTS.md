# Valar Svelte

## 跨框架组件转换：开始前必读

- 将 React、Vue、Svelte 等任意框架的组件转换为另一框架，或替换组件底层交互库时，所有 AI 与人工贡献者必须先阅读 [Valar 跨框架组件转换规范](standards/COMPONENT_PORTING.md)，再开始设计和实现。
- 后续补缺任务见[组件补充清单](standards/COMPONENT_BACKLOG.md)。实施前核对已有能力，完成后更新状态及验收记录链接；清单中的待办不代表已经提供的组件。
- 使用[转换记录模板](standards/templates/COMPONENT_PORTING_RECORD.md)，将能力对照、状态与行为差异、逐项验收及实际证据保存到 `standards/porting-records/<component>-<source>-to-<target>.md`。
- 外观相似或编译通过不代表转换完成；约定范围内的必要能力或验证仍有缺口时，必须标记部分实现或待验证，不能宣称完整转换。
- 不自动读取 `AGENTS.md` 的 AI 工具须在任务上下文中显式收到本文件、规范与模板。未来新建 Valar 的其他框架仓库时同步这套入口和规范，并保留版本信息。

## 仓库约定

- 用户于 2026-10-30 明确要求：以 shadcn-svelte 的完整上游源码为基础深度定制，并允许创建全新组件。本仓库不沿用父目录的 Arc 组件选型要求。
- 根目录是完整上游 monorepo；组件位于 `docs/src/lib/registry/ui/`，不是此前起始工程的 `src/lib/components/ui/`。`_archive/initial-starter/` 仅作归档，不继续在其中实现功能。
- 使用 `.nvmrc` 指定的 Node 24.22.2 与 packageManager 指定的 pnpm 12.14.0；不要使用 npm install 管理本 monorepo。
- 上游基线见 README.md 和 upstream-source-manifest.json。不要自动覆盖本地定制；更新上游前先审阅差异。
- 使用 Svelte、TypeScript、Tailwind CSS 和 shadcn-svelte registry；交互组件优先保留 Bits UI 的键盘与无障碍行为。
- 主题使用语义 token，同时维护浅色与深色。新增组件提供示例及 registry 条目。
- 保留第三方许可证和版权；不引入或分发 Arc Pro 源码。
- 开发改动后按范围执行 pnpm build:cli、pnpm --filter docs check、pnpm build 等检查；明确区分源码完整性验证与运行时验证。
- 上游 GitHub Actions 已归档，自有包已切换为 Valar 命名并保持 private。提交推送不应触发发布或部署；未经授权不发布 npm 包或部署站点。

- 2026-10-30 品牌更新：Valar 是系列名，Svelte 是当前框架后缀；不得将未来 React/Vue 版本写成已提供。
- 自有包使用 @valar/svelte-*，目前全部 private，未发布；安装说明使用仓库内 CLI 与本地 tarball。默认 registry 仅为本地开发地址，不回退上游。
- 不重新引入原站广告、赞助、社群、统计脚本和自动发布工作流；上游来源及许可放在专门说明中保留。
