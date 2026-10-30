# Valar Svelte

个人 Svelte 组件库。基于 shadcn-svelte 深度定制，允许新增原创组件，采用源码 registry 分发。

## 本地开发

使用 Node 24 LTS；项目 `.nvmrc` 固定为已验证的 24.22.2，`engines` 限制为 24.x。先在终端加载 nvm，再执行：

```sh
nvm install
nvm use
npm install
npm run dev
npm run check
npm run build
```

首页提供 Button、Badge、Input、Card 的预览、深浅色切换和表单演示。当前组件保留 shadcn-svelte Vega / Neutral 基线，尚未制定 Valar 的最终视觉规范。

## 目录

- `src/lib/components/ui/`：可直接修改的组件源码。
- `src/lib/utils.ts`：共享类型与 class 合并工具。
- `src/routes/layout.css`：浅色、深色与语义主题变量。
- `src/routes/+page.svelte`：组件工作台。
- `registry.json`：分发清单；`npm run registry:build` 输出到 `static/r/`。
- `THIRD_PARTY_LICENSES/`：第三方许可证，组件源码中也保留声明。

## 在其他项目使用

目标项目先按 [shadcn-svelte 官方安装文档](https://www.shadcn-svelte.com/docs/installation) 初始化 Svelte 5、Tailwind 4 与主题，然后运行（端口以开发服务实际输出为准）：

```sh
npx shadcn-svelte@latest add http://localhost:5173/r/button.json
```

当前 registry 分发组件与工具源码；全局主题在本仓库 `src/routes/layout.css` 中维护，尚未单独分发。目标项目的主题决定最终外观。仓库尚未部署，以上地址仅用于本机开发。

## 定制与新增

1. 修改现有组件源码，或在 `src/lib/components/ui/<name>/` 创建 Svelte 组件和导出入口。
2. 在工作台增加示例，覆盖键盘焦点、禁用和深浅色状态。
3. 在 `registry.json` 登记文件与 npm 依赖；自有组件之间的依赖须使用自己的 registry URL，避免误装同名上游组件。
4. 执行 `npm run check` 和 `npm run build`。

不要使用 CLI 的覆盖选项更新已定制组件；上游更新应逐项审阅。

本仓库按用户明确要求使用 shadcn-svelte，不使用 Arc Pro 源码。第三方组件遵循其 MIT 许可；Valar 自有代码的对外许可尚未指定。当前未发布 npm 包或部署公开 registry。

## CLI 与 Node 环境

使用项目锁定的 CLI 添加组件：

```sh
nvm use
npm run ui -- add separator
```

使用 `npm run ui -- ...`，避免 `npx ...@latest` 临时下载不同版本。`.npmrc` 的 `engine-strict=true` 会在依赖安装时阻止不支持的 Node 版本；已有依赖的运行命令仍须先执行 `nvm use`。

若终端没有加载 nvm，先运行 `source ~/.nvm/nvm.sh`。无需修改系统代理或其他项目的 Node 默认版本。

2026-10-30 验证：Node 26.5.0 下，shadcn-svelte 1.7.2 的代理请求曾出现 `invalid onError method`；Node 24 下通过同一代理成功下载组件。本项目选择已验证的 Node 24 环境，不修改依赖内部实现。
