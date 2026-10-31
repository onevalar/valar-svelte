# Valar 开发约定

跨框架转换组件或替换底层交互库前，必须阅读 [Valar 跨框架组件转换规范](standards/COMPONENT_PORTING.md)，并用[转换记录模板](standards/templates/COMPONENT_PORTING_RECORD.md)保存能力对照与验收证据。AI 的必读入口为 [AGENTS.md](AGENTS.md)。

已讨论的待补组件、能力范围和实施顺序见[组件补充清单](standards/COMPONENT_BACKLOG.md)，后续实现时同步维护状态。

Valar 是组件库系列品牌，Svelte 是当前框架实现。欢迎直接修改组件或新增原创组件，不要求与上游功能或样式保持一致。

- 使用 Node 24.22.2、pnpm 12.14.0；组件源码位于 docs/src/lib/registry/ui。
- 新组件维护示例、文档、registry 条目及键盘和深浅色行为。
- 本次品牌独立化不修改组件样式。之后的设计调整按用户确认的方向进行。
- 不覆盖本地定制源码；上游更新须审阅差异。
- 保留 LICENSE.md、第三方许可和必要的版权声明。
- 发布 npm 包、部署网站或新增自动发布工作流须另行授权。
