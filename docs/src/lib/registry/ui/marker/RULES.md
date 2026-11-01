# Marker 设计规范

- 用于对话中的状态、系统提示、带边框的行或带文字的分隔；样式只用 `variant`（`default`、`border`、`separator`）。
- Marker 默认没有角色，按用途选择：进行中的状态（“正在思考…”）设 `role="status"`；带文字的分隔（日期）不要加 `role="separator"`，否则文字不会被读出。
- `Marker.Icon` 对读屏器隐藏，含义写在 `Marker.Content` 里；只有图标时给 `Marker.Root` 设 `aria-label`。
- 可点击时用 `child` snippet 渲染为 Button 或链接。
