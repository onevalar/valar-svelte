# Valar Svelte

- 本项目按用户 2026-10-30 的明确要求，以 shadcn-svelte 为基础高度定制，并允许创建全新组件。本仓库不沿用父目录的 Arc 组件选型要求。
- 组件源码归本仓库维护；不要自动用上游版本覆盖本地定制。引入上游变更时先审阅差异。
- 使用 Svelte 5、TypeScript、Tailwind CSS 和 shadcn-svelte registry。交互组件优先保留 Bits UI 的键盘与无障碍行为。
- 主题使用语义 CSS token，同时维护浅色与深色。新增组件提供预览及 registry 条目。
- 保留第三方许可证；不引入或分发 Arc Pro 源码。
- 使用满足 package.json engines 的本机 Node；提交前执行 npm run check 和 npm run build。
