# Separator 设计规范

- 方向用 `orientation`（默认横向）；竖向分隔需要父元素有高度或在 flex 行中使用。
- 只起视觉分隔作用时设 `decorative`，读屏器会忽略它；分隔两段有意义的内容时保持默认。
- 粗细和颜色跟随全局边框 token，不要用 `class` 改 `h-*`、`w-*` 或颜色；带文字的分隔在对话中用 `<Marker.Root variant="separator">`。
