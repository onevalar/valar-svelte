# Bubble 设计规范

- 用于聊天中带框的消息内容；一条消息的整行布局（头像、对齐、发送者）交给 Message，左右对齐写在 `Message.Root` 的 `align` 上，而不是 Bubble。
- 样式只用 `variant`（`default`、`secondary`、`muted`、`tinted`、`outline`、`ghost`、`destructive`）；助手的长文本、富内容用 `ghost` 占满整行。不要只靠颜色表示含义，`destructive` 气泡的错误原因要写在文字里。
- 同一发送者连续的气泡放进 `Bubble.Group`。
- 表情回应用 `Bubble.Reactions`（`side`、`align` 定位），只展示时给它设 `role="img"` 和概括全部回应的 `aria-label`；可点击时改用带 `aria-label` 的图标按钮。回应会压在气泡边缘，行间要留出间距。
- 整个气泡需要可点击时，用 `Bubble.Content` 的 `child` snippet 渲染为 Button 或链接，不要给 div 加 `onclick`。
