# Dropdown Menu 设计规范

- 用于点击按钮后展开的一组操作命令；为表单选值用 Select，右键菜单用 Context Menu，站点导航用 Navigation Menu。
- 打开菜单的按钮通过 `DropdownMenu.Trigger` 的 `{#snippet child({ props })}` 渲染 Button；只有图标的触发按钮要有 `aria-label`（检查规则 `valar/trigger-child-snippet`、`valar/icon-button-label`）。
- 操作用 `DropdownMenu.Item` 的 `onSelect`；跳转页面用 `child` snippet 把 `props` 传给 `<a href>`，不要在 Item 里再嵌套链接或按钮。
- 删除等危险操作项设 `variant="destructive"`，并放在最后、用 `DropdownMenu.Separator` 与其他项隔开；不可撤销时先用 Alert Dialog 确认。
- 可勾选的设置用 `DropdownMenu.CheckboxItem`，多选一用 `DropdownMenu.RadioGroup` + `DropdownMenu.RadioItem`；不要用普通 Item 加对勾图标模拟。
- 分组标题用 `DropdownMenu.Label`（或 Group 里的 `GroupHeading`），没有图标的项需要与有图标的项对齐时设 `inset`。
- `DropdownMenu.Shortcut` 只显示快捷键文字，不会绑定按键；显示的快捷键必须在别处真正实现。
- 菜单宽度默认与触发按钮一致；需要更宽时用 `min-w-*` 档位，位置用 `align`、`side` 属性，不要写像素值。
