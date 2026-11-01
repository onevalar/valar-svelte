# Breadcrumb 设计规范

- 结构为 `Breadcrumb.Root` > `Breadcrumb.List` > `Breadcrumb.Item`，项之间放 `Breadcrumb.Separator`；不要手写斜杠或箭头。
- 当前页用 `Breadcrumb.Page`（带 `aria-current="page"`，不可点击），其余层级用带 `href` 的 `Breadcrumb.Link`。
- 默认的导航名称是“面包屑导航”，省略号 `Breadcrumb.Ellipsis` 的读屏文字是“更多”：需要时给 `Breadcrumb.Root` 传更具体的 `aria-label`（如“当前位置”），省略号用 `label` 改。
- 层级过多时中间部分折叠为 `Breadcrumb.Ellipsis`，放进 Dropdown Menu 的触发按钮中展开；窄屏下优先保留首项和最后两级。
