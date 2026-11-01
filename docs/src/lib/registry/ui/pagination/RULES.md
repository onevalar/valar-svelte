# Pagination 设计规范

- 用 `Pagination.Root` 的 `count`（总条数）、`perPage` 和 `bind:page` 驱动页码，`siblingCount` 控制当前页两侧显示几页；不要自己计算页码列表。
- 页码用 `Pagination.Link`（当前页设 `isActive`，带 `aria-current="page"`），前后翻页用 `Pagination.Previous`、`Pagination.Next`，省略用 `Pagination.Ellipsis`。
- 默认文案是中文（导航名称“分页”，按钮“上一页”／“下一页”，省略号“更多页”）：其他语言给 Root 传 `aria-label`，给前后按钮传 `label` 和 `aria-label`，给省略号传 `label`。
- 翻页后把焦点或滚动位置移回列表开头；页码需要出现在网址中时同步到查询参数，刷新后保持当前页。
- 条目很少时不显示分页；“加载更多”的无限列表不要用 Pagination。
