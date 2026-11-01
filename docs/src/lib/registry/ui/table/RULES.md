# Table 设计规范

- 结构用 `Table.Header`、`Table.Body`、`Table.Footer`，行用 `Table.Row`，表头单元格用 `Table.Head`，数据用 `Table.Cell`；用 `Table.Caption` 说明表格内容。
- 表格容器会横向滚动，窄屏下不要压缩列宽到无法阅读；列很多时考虑在移动端改为卡片列表。
- 数字列右对齐并用 `tabular-nums`，便于比较。
- 需要排序、筛选、分页、选择行时，按 Data Table 文档用 TanStack Table 组合，不要自己实现；表头上的排序按钮要说明排序状态。
- 空表格用 Empty 说明原因，不要只显示空白。
