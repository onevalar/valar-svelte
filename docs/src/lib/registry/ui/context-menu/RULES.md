# Context Menu 设计规范

- 右键（触屏为长按）菜单不容易被发现：菜单里的每个操作都必须在界面其他地方也能完成，如工具栏按钮或 Dropdown Menu。
- `ContextMenu.Trigger` 包住响应右键的区域；它渲染为普通容器，里面可以放任意内容。
- 菜单项的写法与 Dropdown Menu 相同：操作用 `onSelect`，危险项设 `variant="destructive"` 并放最后，可勾选项用 `CheckboxItem`、`RadioItem`，`ContextMenu.Shortcut` 只显示文字不绑定按键。
- 不要用它替代浏览器在输入框、链接上的原生右键菜单。
