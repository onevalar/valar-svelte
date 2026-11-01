# Menubar 设计规范

- 只用于桌面应用式界面（编辑器、设计工具）顶部常驻的“文件／编辑／视图”菜单；网站导航用 Navigation Menu，单个按钮的操作菜单用 Dropdown Menu。
- 菜单栏在窄屏下不会自动折叠；移动端改用 Dropdown Menu 或 Sheet 提供同样的操作。
- 菜单项写法与 Dropdown Menu 相同：操作用 `onSelect`，危险项设 `variant="destructive"`，可勾选项用 `CheckboxItem`、`RadioItem`。
- `Menubar.Shortcut` 显示的快捷键必须真正实现，并与系统和浏览器的常用快捷键不冲突。
