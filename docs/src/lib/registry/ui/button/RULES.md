# Button 设计规范

- 一个区域（卡片、弹窗底部、表单）最多一个 `variant="default"` 实心主按钮；其余操作用 `outline`、`secondary` 或 `ghost`。
- 不可撤销的危险操作用 `variant="destructive"`，并先用 Alert Dialog 确认。
- 尺寸只用 `size` 属性（`xs`、`sm`、`default`、`lg`，图标按钮用 `icon`、`icon-sm` 等）；不要用 `class` 写高度、内边距或圆角（检查规则 `valar/button-size-via-prop`）。
- 只有图标的按钮必须有 `aria-label`（检查规则 `valar/icon-button-label`）。
- 跳转用 `href`，不要在按钮里再包一个链接；表单提交用 `type="submit"`。
- 不要用原生 `<button>` 或自己写样式的元素冒充按钮（检查规则 `valar/use-button-component`）。
