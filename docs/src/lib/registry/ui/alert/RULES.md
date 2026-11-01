# Alert 设计规范

- Alert 自带 `role="alert"`，插入页面时会被读屏器立即播报；页面加载时就存在、只是说明性质的提示，传 `role="status"` 或改用普通文字、Card。
- 类型只用 `variant`（`default`、`destructive`），不要自定义背景色；同时配合图标和文字说明，不要只靠颜色区分。
- 结构用 `Alert.Title` 写要点、`Alert.Description` 写细节和解决办法；图标作为第一个子元素放在 Alert 内；相关操作放进 `Alert.Action`。
- 操作完成后的短暂反馈用 Sonner，需要用户确认的操作用 Alert Dialog。
