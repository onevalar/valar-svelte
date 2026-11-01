# Alert Dialog 设计规范

- 只用于需要用户明确确认的操作，如删除、覆盖、放弃未保存的修改；普通表单和内容用 Dialog，操作结果的通知用 Sonner。
- 必须有 `AlertDialog.Title` 和 `AlertDialog.Description`：标题直接问要做的事（“删除这个项目？”），说明写清后果以及能否撤销（检查规则 `valar/overlay-title`）。
- 必须有 `AlertDialog.Cancel`：点击遮罩不会关闭，用户只能按 Esc 或点按钮离开（检查规则 `valar/alert-dialog-cancel`）。
- 按钮文字写具体动作（“删除”“放弃修改”），不要写“确定”“是”。危险操作的 `AlertDialog.Action` 设 `variant="destructive"`；Action 和 Cancel 的尺寸只用 `size` 属性（检查规则 `valar/button-size-via-prop`）。
- `AlertDialog.Action` 不会自动关闭对话框：用 `bind:open` 控制，在操作成功后设为 `false`；异步操作期间禁用 Action 并显示 Spinner，失败时保留对话框并显示错误原因。
- 按钮放在 `AlertDialog.Footer`，按 Cancel、Action 的顺序书写；Footer 在窄屏下自动改为纵向排列，不要手写布局。
- 简短的确认用 `<AlertDialog.Content size="sm">`；需要图标时放进 `AlertDialog.Media`，不要自己写带颜色的图标容器。
- 打开它的按钮通过 `AlertDialog.Trigger` 的 `child` snippet 渲染 Button（检查规则 `valar/trigger-child-snippet`）。
