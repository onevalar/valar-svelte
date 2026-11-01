# Trace 设计规范

- 用于展示代理执行的步骤（调用工具、运行命令、编辑文件）；代理的回复用 Message，轮次之间的提示和分隔用 Marker。
- `Trace.Title` 是这一步的名称，写成说明发生了什么的完整短句（“已编辑 trace.svelte”），不要只写文件名；`Trace.Icon` 对读屏器隐藏。
- 状态用 `Trace.Line` 的 `status`（`running`、`error`、`pending`，完成的步骤不设），并同时写进标题：进行中用“正在运行 pnpm build”，失败用“运行 pnpm build 失败”。
- 有细节时用 `Trace.Collapsible` + `Trace.CollapsibleTrigger` + `Trace.CollapsibleContent`；也可以把 Line 包在链接或 Dialog、Sheet 的触发按钮中，它会获得对应的键盘行为。
- 链接在新标签页打开时，在标题后加 `sr-only` 的“（在新标签页打开）”；CollapsibleContent 中带背景色的块要设 `text-foreground` 保持对比度。
