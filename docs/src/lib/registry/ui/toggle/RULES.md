# Toggle 设计规范

- 用于按下／弹起两种状态的工具按钮（如加粗、显示网格）；表单中的开关设置用 Switch，执行一次性操作用 Button。
- 状态用 `bind:pressed`；样式和尺寸只用 `variant`（`default`、`outline`）和 `size`（`sm`、`default`、`lg`）。
- 只有图标时必须有 `aria-label`，名称描述功能而不是状态（“加粗”，不要写“开启加粗”）。
- 一组互相关联的切换按钮用 Toggle Group。
