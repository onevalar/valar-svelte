# Sidebar 设计规范

- 应用外层放 `Sidebar.Provider`（已包含 `Tooltip.Provider`），里面放 `Sidebar.Root` 和主内容；使用 `variant="inset"` 时主内容必须包在 `Sidebar.Inset` 中。需要读写展开状态时用 `useSidebar()`，不要自己维护。
- 折叠方式用 `collapsible`（`offcanvas`、`icon`、`none`），样式用 `variant`（`sidebar`、`floating`、`inset`），位置用 `side`；展开、收起和图标模式的宽度在 `constants.ts` 的 `SIDEBAR_WIDTH*` 中统一修改，不要在 `class` 里写宽度。
- 菜单项用 `Sidebar.MenuButton`；跳转用 `child` snippet 渲染 `<a href>`。当前页设 `isActive`，它只改变样式，链接上还要设 `aria-current="page"`。
- `collapsible="icon"` 时每个 MenuButton 都要设 `tooltipContent`，否则收起后只剩图标没有说明。
- `Sidebar.Trigger` 和 `Sidebar.Rail` 的读屏名称默认是“切换侧边栏”（Trigger 用 `label` 改，Rail 用 `aria-label` 改）；移动端抽屉的隐藏标题用 `Sidebar.Root` 的 `mobileTitle`、`mobileDescription` 改。侧栏已绑定 ⌘B／Ctrl+B 快捷键，不要再把它分给其他功能。
- 展开状态会写入名为 `SIDEBAR_COOKIE_NAME` 的 cookie；需要刷新后保持时，在服务端 `load` 中读取它并传给 `Sidebar.Provider` 的 `open`，避免页面闪动。
