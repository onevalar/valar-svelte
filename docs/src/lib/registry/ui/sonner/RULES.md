# Sonner 设计规范

- 在根布局放一次 `<Toaster />`，在任意位置用 `svelte-sonner` 的 `toast()` 发通知；不要在多个页面各放一个 Toaster。
- Toaster 的浅色／深色跟随 mode-watcher；项目的深色模式也应由 mode-watcher 管理，否则通知不会随之切换。
- 只用于操作完成后的简短反馈（“已保存”“已复制链接”）；需要用户处理的错误用 Alert 或表单内的 Field.Error，需要确认的操作用 Alert Dialog。
- 按结果选择 `toast.success`、`toast.error`、`toast.info`、`toast.warning`，等待中的操作用 `toast.promise` 或 `toast.loading`；不要用自定义颜色区分类型。
- 文案写结果本身，不写“操作成功”这类空话；可撤销的操作通过 `action: { label: "撤销", onClick }` 提供撤销，并保证停留时间足够点击。
- 不要每次输入、每次自动保存都弹通知；同一结果连续触发时复用同一个 `id` 更新已有通知。
