# Sheet 设计规范

- 用于从屏幕边缘滑出、与当前页面相关的辅助内容，如筛选条件、详情、设置；需要用户专注完成的流程用 Dialog，移动端可拖拽关闭的底部面板用 Drawer。
- 每个 `Sheet.Content` 都要有 `Sheet.Title`，不显示时加 `class="sr-only"`（检查规则 `valar/overlay-title`）。
- 方向只用 `side` 属性（`top`、`right`、`bottom`、`left`，默认 `right`），不要用 `class` 改定位。
- 左右面板的宽度、滑入距离、动效档位跟随组件默认值和组件参数；不要在 `Sheet.Content` 上写 `w-[...]`、`duration-*` 覆盖。
- `Sheet.Header`、`Sheet.Footer` 自带内边距；夹在中间的正文容器用与 Header 相同的横向内边距，并加 `flex-1 overflow-y-auto`，让长内容在面板内部滚动、Footer 留在底部。
- 打开它的按钮通过 `Sheet.Trigger` 的 `child` snippet 渲染 Button（检查规则 `valar/trigger-child-snippet`）。
- 右上角关闭按钮的读屏文字默认是“关闭”，其他语言用 `Sheet.Content` 的 `closeLabel` 改。
