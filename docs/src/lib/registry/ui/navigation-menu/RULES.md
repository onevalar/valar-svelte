# Navigation Menu 设计规范

- 只用于网站的主导航（带下拉面板的顶部导航）；页面内的操作菜单用 Dropdown Menu，应用式菜单栏用 Menubar。
- 每个入口都是 `NavigationMenu.Link`（设 `href`）；有子菜单的项用 `NavigationMenu.Trigger` + `NavigationMenu.Content`，Trigger 本身不跳转，子菜单中要包含该栏目的入口链接。
- 当前页面的链接设 `active`（会带 `aria-current="page"`），不要只改颜色。
- 窄屏下不要强行横排：移动端改用 Sheet 或 Drawer 承载同样的链接。
- 下拉面板默认渲染在共享的 viewport 中（`viewport`，默认开启）；不需要时设 `viewport={false}`，不要自己写定位。
