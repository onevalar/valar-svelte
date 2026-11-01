# Badge 设计规范

- 用于状态、分类、计数等简短标记；样式只用 `variant`（`default`、`secondary`、`destructive`、`outline`、`ghost`、`link`），不要自定义背景色。
- Badge 不是按钮：需要点击执行操作时用 `Button size="xs"` 等小号按钮；需要跳转时给 Badge 设 `href`，它会渲染为链接。
- 文字保持一两个词；用颜色表示状态时文字本身也要说明状态（“已失败”），不要只靠颜色。
