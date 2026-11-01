# Hover Card 设计规范

- 只用于链接的补充预览，如用户名、仓库、文章链接；可操作的内容用 Popover，简短说明用 Tooltip。
- `HoverCard.Trigger` 渲染为链接，应设 `href` 指向完整内容：触屏设备没有悬停，用户点击后要能直接到达预览中的信息。
- 预览中不要放只能在这里完成的操作；键盘聚焦链接时也会打开预览，但内容不在 Tab 顺序中，读屏用户可能读不到。
- 位置用 `side`（默认 `bottom`）、`align`、`sideOffset`；打开和关闭延迟用 `openDelay`、`closeDelay`，同一项目内保持一致。
